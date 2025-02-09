# Nostra Labs Contracts

Nostra Labs’ smart contract package powers Catalyst—a decentralized game lab designed for experimental research into cooperative behavior. This repository includes three key contracts:

- **StakingContract**
- **SwapEscrow**
- **TestNostraToken**

---

## Contract Overview

### StakingContract
- **Purpose:**  
  - Manages game rounds where players stake tokens.
  - Handles round initialization, player entry/exit, and round resolution.
  - Distributes rewards in winning rounds and applies penalties in losing rounds.
- **Key Features:**  
  - **Entry Fee & Penalties:** Collects a small fee per entry.
  - **Per-Player Stake Cap:** Limits the maximum stake per player for each round.
  - **Reward Distribution:**  
    - **Winning Rounds:** If the total stake meets the threshold, the pot is multiplied, and the total reward is redistributed equally among all participants.
    - **Losing Rounds:** If the threshold is not met, 50% (configurable via `burnPercentage`) of each player’s stake is burned, and the remaining 50% is allocated to the treasury.
  - **Dynamic Adjustments:** Allows the host agent (MrsBeauty) to adjust thresholds and multipliers between rounds.
- **Usage:**  
  - The core of the Catalyst game: players interact with this contract through the web UI to join rounds and manage stakes.
  - Integrated with our off-chain AI agent (MrsBeauty) for dynamic game tuning.

### SwapEscrow
- **Purpose:**  
  - Facilitates token swaps between TestNostraToken (tNST) and USDC.
  - Acts as an escrow for liquidity.
- **Key Features:**  
  - **Fixed Swap Ratio:** Users swap tokens at a constant ratio (e.g., 1000 tNST = 1 USDC).
  - **Liquidity Management:** Allows the contract owner to fund the escrow with USDC.
- **Usage:**  
  - Provides seamless token exchange within the Catalyst ecosystem.

### TestNostraToken
- **Purpose:**  
  - A mintable ERC20 token used as the in-game currency for Catalyst.
- **Key Features:**  
  - **Mint Function:** Users can mint a fixed amount from a faucet (only once per address).
  - **Owner Minting:** The owner can mint tokens as needed.
- **Usage:**  
  - Used by players to stake in game rounds and engage in gameplay.
  
---

## Deployed Contract Addresses

For details on deployed contracts, refer to the following JSON files:

- **Arbitrum Sepolia:**  
  [Deployed Addresses on Arbitrum Sepolia](https://github.com/lestrom/nostra-labs/blob/main/packages/contracts/ignition/deployments/chain-421614/deployed_addresses.json)

- **Base Sepolia:**  
  [Deployed Addresses on Base Sepolia](https://github.com/lestrom/nostra-labs/blob/main/packages/contracts/ignition/deployments/chain-84532/deployed_addresses.json)

---

## How We Plan to Use These Contracts

- **StakingContract:**  
  - Serves as the backbone of the Catalyst game.
  - Players stake tokens, join rounds, and receive rewards or incur penalties based on round outcomes.
  - MrsBeauty, our AI host, adjusts round parameters in real time to balance cooperation and free riding.

- **SwapEscrow:**  
  - Manages liquidity by enabling token swaps between our in-game currency (tNST) and USDC.
  - Ensures that players can easily convert tokens as part of the broader ecosystem.

- **TestNostraToken:**  
  - Acts as the primary currency for Catalyst.
  - Users mint tokens from a faucet to participate in staking and game rounds.

---

## Getting Started

### Prerequisites
- An Ethereum-compatible wallet (e.g., MetaMask)
- Node.js and npm
- Access to a testnet (e.g., Sepolia) for deploying and interacting with contracts

### Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/nostra-labs.git
   cd nostra-labs/packages/contracts

2. **Install Dependencies:**

 ## Installation and Deployment Instructions

### Install Dependencies:
```
npm install
```

### Configure Environment Variables:
Create a `.env` file in the root of the contracts package (if required) with your network and deployment settings.

### Deploy Smart Contracts:
Use your preferred framework (e.g., Hardhat or Truffle) to deploy the contracts to a testnet.  
Example Hardhat deployment:
```
npx hardhat run scripts/deploy.js --network sepolia
```

### Run Tests:
```
npx hardhat test
```

## Contributing

Contributions are welcome! To contribute:

1. **Fork the repository.**
2. **Create a new branch:**
   ```
   git checkout -b feature/your-feature
   ```
3. **Commit your changes:**
   ```
   git commit -am "Describe your feature"
   ```
4. **Push the branch:**
   ```
   git push origin feature/your-feature
   ```
5. **Open a Pull Request** describing your changes.

For major changes, please open an issue first to discuss your ideas.
