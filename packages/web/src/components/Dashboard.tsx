import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatEther } from 'ethers';
import { Button } from '@/components/ui/button'; // Your UI button component (or use OnchainKit’s if available)
import {
  NostraTokenAddress,
  StakingContractAddress,
  NostraTokenABI,
  StakingContractABI,
} from './address-abi';
import { WalletComponents } from '@/components/buttons/walletConnect'; // Your wallet connection components
import AgentRoute from '@/routes/chat';
import '@coinbase/onchainkit/styles.css';
import StakeUnstake from './StakeUnstake';
import { useOnchainKit } from '@coinbase/onchainkit';

export default function Dashboard() {
  const { address } = useOnchainKit();
  // Local state for wallet, balances, and loading indicators
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [_isConnected, setIsConnected] = useState(false);
  const [stakedBalance, setStakedBalance] = useState<ethers.BigNumberish>(BigInt(0));
  const [availableBalance, setAvailableBalance] = useState<ethers.BigNumberish>(BigInt(0));
  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumberish>(BigInt(0));
  const [isMinting, _setIsMinting] = useState(false);
  const [isStaking, _setIsStaking] = useState(false);
  const [isUnstaking, _setIsUnstaking] = useState(false);

  // Initialize ethers provider (assumes MetaMask or similar is installed)
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Check if wallet is connected
  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          setUserAddress(null);
        }
      }
    }
    checkConnection();
  }, [address]);

  // Fetch balances from both contracts
  async function fetchBalances() {
    if (!userAddress) return;
    try {
      const signer = await provider.getSigner();

      // Get NostraToken balance (minted tokens)
      const nostraTokenContract = new ethers.Contract(NostraTokenAddress, NostraTokenABI, signer);
      const tokenBal: ethers.BigNumberish = await nostraTokenContract.balanceOf(userAddress);
      setTokenBalance(tokenBal);

      // Get staking balances (assumes the StakingContract's players mapping returns an object like: { availableStakes, unavailableStakes })
      const stakingContract = new ethers.Contract(
        StakingContractAddress,
        StakingContractABI,
        signer,
      );
      const playerData = await stakingContract.players(userAddress);
      setAvailableBalance(playerData.availableStakes);
      setStakedBalance(playerData.unavailableStakes);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }

  // Re-fetch balances after actions (mint, stake, unstake)
  useEffect(() => {
    if (userAddress) {
      fetchBalances();
    }
  }, [userAddress, isMinting, isStaking, isUnstaking]);

  // --- Minting: Interact with NostraToken.sol ---

  // --- Staking: Interact with the StakingContract ---

  // Determine which UI to show based on staked balance:
  // If stakedBalance > 0, show the Mrs. Beauty Chat Card; otherwise, show Mint & Stake buttons.
  const showChatCard = ethers.getBigInt(stakedBalance) > BigInt(0);

  return (
    <div>
      {/* Only render wallet-dependent UI when wallet is connected */}

      <>
        {/* --- Top Bar: Wallet Connection Button --- */}
        <div className="items-center justify-center gap-4">
          <div className="fixed right-6 top-8 z-0 p-0 text-right">
            <WalletComponents />
          </div>
        </div>

        {/* --- Always-Visible Information --- */}
        <div className="absolute right-10 top-48 rounded border border-l-4 border-gray-300 bg-black p-4 text-center text-right shadow-lg">
          <div className="">
            <p>Token Balance: {formatEther(tokenBalance)} NST</p>
            <p>Available to Unstake: {formatEther(availableBalance)} NST</p>
          </div>
        </div>

        {/* --- Main Content: Either Mint/Stake or Chat Card --- */}
        <div className="flex h-screen flex-col items-center justify-center gap-8">
          {!showChatCard ? (
            <StakeUnstake />
          ) : (
            <div className="w-full max-w-lg rounded-lg border bg-white p-8 shadow-xl">
              {/* Mrs. Beauty Chat Card */}
              <h2 className="mb-4 text-center text-2xl font-bold">MrsBeauty Chat</h2>
              <p className="mb-4 text-center text-xl">
                Your Staked Balance: {formatEther(stakedBalance)} NST
              </p>
              {/* Render the chat interface */}
              <AgentRoute />
              <div className="mt-4 border-t pt-4">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full rounded-lg border p-3 text-xl"
                />
                <Button className="mt-4 h-14 w-full rounded-lg bg-purple-500 text-xl text-white hover:bg-purple-600">
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* --- Bottom-Left: Connected Wallet Indicator --- */}
        {/* <div className="fixed bottom-4 left-4 bg-gray-200 p-3 rounded shadow text-lg">
            Connected: {userAddress}
          </div> */}
      </>
    </div>
  );
}
