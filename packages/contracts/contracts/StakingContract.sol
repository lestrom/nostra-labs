// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract is ReentrancyGuard {
    IERC20 public gameToken;
    address public hostAgent;
    address public treasuryManager;

    uint256 public entryFee;
    uint256 public burnPercentage;

    event TokensBurned(address indexed user, uint256 amount);
    event RoundThresholdAdjusted(uint256 indexed roundId, uint256 newThreshold);
    event RoundMultiplierAdjusted(uint256 indexed roundId, uint256 newMultiplier);

    struct Round {
        uint256 maxPlayerCount;
        uint256 threshold;
        uint256 multiplier;
        uint256 expiryBlockNumber;
        uint256 totalStaked;
        uint256 maxStakePerPlayer; // NEW: maximum stake allowed per player in this round
        bool isResolved;
        mapping(address => uint256) playerStakes;
        address[] players;
    }

    struct Player {
        uint256 availableStakes;
        uint256 unavailableStakes;
    }

    mapping(uint256 => Round) public rounds;
    mapping(address => Player) public players;
    uint256 public currentRoundId;
    uint256 public treasuryBalance;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RoundInitialized(uint256 indexed roundId, uint256 playerCount, uint256 threshold, uint256 multiplier, uint256 expiryBlock);
    event UserEnteredRound(address indexed user, uint256 indexed roundId, uint256 amount);
    event UserExitedRound(address indexed user, uint256 indexed roundId, uint256 amount);
    event RoundResolved(uint256 indexed roundId, string resolution, address[] players, uint256[] distributions);
    event TreasuryBalanceChange(uint256 newBalance);
    event Investment(uint256 amount, address indexed to);
    event BurnPercentageUpdated(uint256 newBurnPercentage);

    modifier onlyHostAgent() {
        require(msg.sender == hostAgent, "Only host agent allowed");
        _;
    }

    modifier onlyTreasuryManager() {
        require(msg.sender == treasuryManager, "Only treasury manager allowed");
        _;
    }

    modifier onlyHostOrPlayer(address player) {
        require(msg.sender == hostAgent || msg.sender == player, "Unauthorized");
        _;
    }

    constructor(
        address _gameToken,
        address _hostAgent,
        address _treasuryManager,
        uint256 _entryFee,
        uint256 _burnPercentage
    ) {
        gameToken = IERC20(_gameToken);
        hostAgent = _hostAgent;
        treasuryManager = _treasuryManager;
        entryFee = _entryFee;
        burnPercentage = _burnPercentage;
    }

    function updateBurnPercentage(uint256 _burnPercentage) external onlyTreasuryManager {
        require(_burnPercentage <= 100, "Burn percentage must not exceed 100");
        burnPercentage = _burnPercentage;
        emit BurnPercentageUpdated(_burnPercentage);
    }

    function stake(uint256 amount) external nonReentrant {
        require(gameToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        players[msg.sender].availableStakes += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(players[msg.sender].availableStakes >= amount, "Insufficient available stakes");
        players[msg.sender].availableStakes -= amount;
        require(gameToken.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    // Updated initializeRound to include maxStakePerPlayer parameter and a cap check.
    function initializeRound(
        uint256 maxPlayerCount,
        uint256 threshold,
        uint256 multiplier,
        uint256 expiryBlock,
        uint256 maxStakePerPlayer  // NEW: cap per player in this round
    ) external onlyHostAgent {
        require(expiryBlock > block.number, "Invalid expiry block");
        require(multiplier >= 100, "Invalid multiplier");
        require(maxPlayerCount > 0, "Invalid player count");
        require(threshold > 0, "Invalid threshold");
        require(maxStakePerPlayer > 0, "Invalid max stake per player");
        require(maxPlayerCount * maxStakePerPlayer >= threshold, "Threshold too high for allowed stakes");

        currentRoundId++;
        Round storage newRound = rounds[currentRoundId];
        newRound.maxPlayerCount = maxPlayerCount;
        newRound.threshold = threshold;
        newRound.multiplier = multiplier;
        newRound.expiryBlockNumber = expiryBlock;
        newRound.maxStakePerPlayer = maxStakePerPlayer; // NEW

        emit RoundInitialized(currentRoundId, maxPlayerCount, threshold, multiplier, expiryBlock);
    }

    function adjustRoundThreshold(
        uint256 roundId,
        int256 thresholdDeltaPercent
    ) external onlyHostAgent {
        Round storage round = rounds[roundId];
        require(!round.isResolved, "Round already resolved");
        require(block.number < round.expiryBlockNumber, "Round expired");

        uint256 newThreshold;
        if (thresholdDeltaPercent >= 0) {
            newThreshold = round.threshold + ((round.threshold * uint256(thresholdDeltaPercent)) / 100);
        } else {
            uint256 absDelta = uint256(-thresholdDeltaPercent);
            uint256 decrease = (round.threshold * absDelta) / 100;
            newThreshold = (round.threshold > decrease) ? round.threshold - decrease : round.threshold;
        }
        require(newThreshold > 0, "Invalid threshold");

        round.threshold = newThreshold;
        emit RoundThresholdAdjusted(roundId, newThreshold);
    }

    function adjustRoundMultiplier(
        uint256 roundId,
        int256 multiplierDeltaPercent
    ) external onlyHostAgent {
        Round storage round = rounds[roundId];
        require(!round.isResolved, "Round already resolved");
        require(block.number < round.expiryBlockNumber, "Round expired");

        uint256 newMultiplier;
        if (multiplierDeltaPercent >= 0) {
            newMultiplier = round.multiplier + ((round.multiplier * uint256(multiplierDeltaPercent)) / 100);
        } else {
            uint256 absDelta = uint256(-multiplierDeltaPercent);
            uint256 decrease = (round.multiplier * absDelta) / 100;
            newMultiplier = (round.multiplier > decrease) ? round.multiplier - decrease : round.multiplier;
        }
        require(newMultiplier >= 100, "Multiplier must be at least 100");

        round.multiplier = newMultiplier;
        emit RoundMultiplierAdjusted(roundId, newMultiplier);
    }

    // Updated enterRound to enforce per-player stake cap
    function enterRound(uint256 roundId, address player, uint256 amount) external nonReentrant onlyHostOrPlayer(player) {
        Round storage round = rounds[roundId];
        require(!round.isResolved, "Round already resolved");
        require(block.number < round.expiryBlockNumber, "Round expired");
        require(round.players.length < round.maxPlayerCount, "Round full");
        require(players[player].availableStakes >= amount + entryFee, "Insufficient available stakes");
        require(round.playerStakes[player] + amount <= round.maxStakePerPlayer, "Exceeds per-player stake cap");

        players[player].availableStakes -= (amount + entryFee);
        players[player].unavailableStakes += amount;
        treasuryBalance += entryFee;

        if (round.playerStakes[player] == 0) {
            round.players.push(player);
        }
        round.playerStakes[player] += amount;
        round.totalStaked += amount;

        emit UserEnteredRound(player, roundId, amount);
        emit TreasuryBalanceChange(treasuryBalance);
    }

    function exitRound(uint256 roundId, address player, uint256 amount) external nonReentrant onlyHostOrPlayer(player) {
        Round storage round = rounds[roundId];
        require(!round.isResolved, "Round already resolved");
        require(block.number < round.expiryBlockNumber, "Round expired");
        require(round.playerStakes[player] >= amount, "Insufficient stake in round");

        round.playerStakes[player] -= amount;
        round.totalStaked -= amount;

        players[player].unavailableStakes -= amount;
        players[player].availableStakes += amount;

        emit UserExitedRound(player, roundId, amount);
    }

    function resolveRound(uint256 roundId) external nonReentrant {
        Round storage round = rounds[roundId];
        require(!round.isResolved, "Round already resolved");
        require(block.number >= round.expiryBlockNumber, "Round not expired");

        round.isResolved = true;
        address[] memory roundPlayers = round.players;
        uint256[] memory distributions = new uint256[](roundPlayers.length);

        if (round.totalStaked >= round.threshold) {
            // Winning round: redistribute the total reward equally among all participants.
            uint256 totalReward = round.totalStaked * round.multiplier / 100;
            uint256 surplusReward = totalReward - round.totalStaked;
            require(treasuryBalance >= surplusReward, "Insufficient treasury balance for rewards");

            treasuryBalance -= surplusReward;
            uint256 numPlayers = round.players.length;
            uint256 equalReward = totalReward / numPlayers;

            for (uint256 i = 0; i < numPlayers; i++) {
                address player = round.players[i];
                distributions[i] = equalReward;
                players[player].unavailableStakes -= round.playerStakes[player];
                players[player].availableStakes += equalReward;
                require(gameToken.transfer(player, equalReward), "Reward transfer failed");
            }

            emit RoundResolved(roundId, "THRESHOLD_MET", round.players, distributions);
            emit TreasuryBalanceChange(treasuryBalance);
        } else {
            // Losing round: for each player, burn 50% of their stake and send the remaining 50% to treasury.
            for (uint256 i = 0; i < round.players.length; i++) {
                address player = round.players[i];
                uint256 playerStake = round.playerStakes[player];
                distributions[i] = 0;
                players[player].unavailableStakes -= playerStake;

                uint256 amountToBurn = (playerStake * burnPercentage) / 100;
                uint256 amountToTreasury = playerStake - amountToBurn;

                require(gameToken.transfer(address(0), amountToBurn), "Burn transfer failed");
                emit TokensBurned(player, amountToBurn);

                treasuryBalance += amountToTreasury;
            }

            emit RoundResolved(roundId, "THRESHOLD_NOT_MET", round.players, distributions);
            emit TreasuryBalanceChange(treasuryBalance);
        }
    }

    function investDeSci(address project, uint256 amount) external onlyTreasuryManager {
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        treasuryBalance -= amount;
        require(gameToken.transfer(project, amount), "Investment transfer failed");
        emit Investment(amount, project);
        emit TreasuryBalanceChange(treasuryBalance);
    }

    function getActiveRounds() external view returns (uint256[] memory) {
        uint256[] memory activeRounds = new uint256[](currentRoundId);
        uint256 count = 0;

        for (uint256 i = 1; i <= currentRoundId; i++) {
            if (!rounds[i].isResolved && block.number < rounds[i].expiryBlockNumber) {
                activeRounds[count] = i;
                count++;
            }
        }

        assembly {
            mstore(activeRounds, count)
        }

        return activeRounds;
    }

    function getRoundPlayers(uint256 roundId) external view returns (
        address[] memory addresses,
        uint256[] memory stakes
    ) {
        Round storage round = rounds[roundId];
        addresses = round.players;
        stakes = new uint256[](addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            stakes[i] = round.playerStakes[addresses[i]];
        }
    }

    function getRoundInfo(uint256 roundId) external view returns (
        uint256 maxPlayerCount,
        uint256 threshold,
        uint256 multiplier,
        uint256 expiryBlockNumber,
        uint256 totalStaked,
        bool isResolved
    ) {
        Round storage round = rounds[roundId];
        return (
            round.maxPlayerCount,
            round.threshold,
            round.multiplier,
            round.expiryBlockNumber,
            round.totalStaked,
            round.isResolved
        );
    }
}
