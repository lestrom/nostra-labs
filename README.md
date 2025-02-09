# Nostra Labs – Catalyst, hosted by Mrs Beauty

**Catalyst** is a Web3 game lab designed for experimental research into cooperative behavior and the prisoner’s dilemma. Players stake tokens in rounds managed by our dynamic AI host, **MrsBeauty**, while gameplay data fuels decentralized science (DeSci) research. The web app features a retro arcade-inspired UI that makes the experience both engaging and visually nostalgic.

---

## Table of Contents

- [Overview](#overview)
- [Repository Structure & Packages](#repository-structure--packages)
- [Architecture](#architecture)
  - [On-Chain Smart Contracts](#on-chain-smart-contracts)
  - [Off-Chain AI Agent (MrsBeauty)](#off-chain-ai-agent-mrsbeauty)
  - [Web UI](#web-ui)
- [UX/UI Flow](#uxui-flow)
- [How It Works](#how-it-works)
- [Technical Stack](#technical-stack)
- [Deployed Contract Addresses](#deployed-contract-addresses)

---

## Overview

Catalyst is an experimental game that simulates the tension between cooperation and free riding. Players participate in game rounds by staking tokens; if the collective threshold is met, the pot is multiplied and redistributed equally among participants. If not, penalties apply—50% of the stake is burned, and the remaining 50% is added to the treasury. The AI host, MrsBeauty, dynamically adjusts game parameters in real time to keep the experience engaging, and all gameplay data contributes to research in decentralized governance and economic behavior.

---

## Repository Structure & Packages

The repository is organized under the `nostra-labs/packages/` directory into several distinct packages:

- **agent**  
  Orchestrates game parameters (a future feature). This package will enable dynamic adjustment of game rules and connect to both Telegram and Twitter, allowing MrsBeauty to interact with users across multiple platforms.

- **characterfile**  
  A GitHub submodule used as a tool to build our agents’ knowledge base. This package is not our core code but rather a utility for managing structured character data.

- **contracts**  
  Contains the Solidity smart contracts (StakingContract, SwapEscrow, TestNostraToken) along with deployment scripts for multiple networks. Deployment scripts include configurations for Arbitrum + Arbitrum Sepolia and Base + Base Sepolia.

- **gaianet**  
  Provides configuration files and snapshot data (e.g., `gemma.json`, `llama.json`, `mistral-xs.json`, `mistral.json`, `my.snapshot.tar.gz`) for our AI models. These files define endpoints, context sizes, and model parameters for the Gaianet node integration.

- **web**  
  Contains the front-end code for the Catalyst Web App. The web UI is designed with a retro arcade aesthetic, allowing players to connect wallets, mint tokens, stake funds, view live game dashboards, and interact with MrsBeauty.

## Architecture

### On-Chain Smart Contracts
- **Staking & Redistribution:**  
  Handles token locking, round initialization, and resolution.  
  - **Winning Rounds:** If the threshold is met, the total reward pot is multiplied, and the surplus is distributed equally among players.
  - **Losing Rounds:** If the threshold is not met, 50% of each player's stake is burned, and the remaining 50% is transferred to the treasury.
- **Treasury Pool:**  
  Collects entry fees, funds DeSci investments, and processes loss rebates.
- **Trust Score Oracle (Planned):**  
  Tracks player behavior to update reputations and inform dynamic game adjustments.

### Off-Chain AI Agent (MrsBeauty)
- **Rule Engine:**  
  Dynamically adjusts round parameters (thresholds and multipliers) based on real-time game data.
- **Behavioral Analytics:**  
  Tags player actions and generates datasets to support decentralized research.
- **Chatbot Interface:**  
  Hosts games via Telegram and other channels, providing real-time updates and strategic insights.

### Web UI
- **Retro Arcade Design:**  
  A vintage, arcade-inspired interface where players can:
  - Connect their wallets.
  - Mint tokens from a faucet.
  - Stake tokens and join game rounds.
  - View real-time dashboards with game stats and treasury health.
- **Live Dashboards:**  
  Provide continuous updates on active rounds, staked balances, and research insights.

---

## UX/UI Flow

1. **Pre-Game Access & Arcade Landing**  
   - **Landing Page (https://www.nostralabs.org/):**  
     - Displays an immersive arcade room background.
     - Includes a transparent navbar with the Nostra Labs logo (top-left) and social/connect buttons (top-right).
     - Features an arcade machine graphic with a PLAY button.
   - **Interaction:**  
     - When the player clicks PLAY, the UI transitions into the game environment.

2. **Post-Connection UI Flow**  
   - **Wallet Connection:**  
     - Players connect their wallets.
   - **Staked Balance Check:**  
     - If the player’s staked balance > 0 in the StakingContract, the MrsBeauty Chat Card is shown immediately.
     - If the staked balance = 0, the UI displays two central buttons: Mint and Stake.
   
3. **Token Minting & Staking**  
   - **Token Minting:**  
     - The **Mint** button calls the `mint()` method from the NostraToken contract.
     - Players must eventually hold at least 300 tNST to enter games.
   - **Token Staking:**  
     - The **Stake** button (initially disabled until tokens are minted) calls the `stake()` method from the StakingContract.
     - In each game round, players can stake up to 100 tNST.
   - **After Staking:**  
     - The UI refreshes, and the MrsBeauty Chat Card appears to unlock in-game interactions.

4. **MrsBeauty Chat Card**  
   - Displays only after staking is complete.
   - Provides a chat interface to interact with MrsBeauty.
   - Shows the player’s staked tNST balance above the chat input.

5. **Unstaking**  
   - An **Unstake** button (located near the Wallet Connect button) calls the `unstake()` method, allowing players to withdraw tokens.
   - The UI continuously displays the Available to Unstake Balance.

6. **In-Game Functions**  
   - **Round Participation:**  
     - Players view active rounds, join rounds with `enterRound()`, and exit rounds with `exitRound()`.
   - **Round Resolution:**  
     - After a round expires, `resolveRound()` determines the outcome:
       - **Winning:** Pot is multiplied and redistributed equally among players.
       - **Losing:** 50% of each player's stake is burned; the remainder is added to the treasury.
   - **Additional Functions:**  
     - Treasury functions (e.g., `investDeSci()`) and dynamic adjustments (e.g., `adjustRoundThreshold()`, `adjustRoundMultiplier()`) are used for fine-tuning.

---

## How It Works

- **Connect & Mint:**  
  Players connect their wallets and mint tokens from a faucet if needed.
  
- **Join a Round:**  
  Players stake tokens to join a round. An entry fee is collected, and MrsBeauty dynamically sets and adjusts game parameters.

- **Play & Strategize:**  
  Participants decide whether to cooperate fully or free ride. The tension between collective cooperation and individual risk is at the heart of Catalyst—further complicated by potential AI “double agents.”

- **Win or Lose:**  
  - **Win:**  
    If the threshold is met, the total reward pot is multiplied and the surplus is shared equally among all players.
  - **Lose:**  
    If the threshold is not met, 50% of each player's stake is burned and the remaining 50% is added to the treasury.

- **Fuel DeSci:**  
  Staking fees are auto-invested into DeSci projects, and gameplay data is tokenized and shared with researchers and the broader web3 community.

---

## Technical Stack

- **Frontend:**  
  - Built using React with TypeScript.
  - Styled with Tailwind CSS for a retro arcade look.
  - Wallet integration via ethers.js.
  - Deployed as a modern web app with interactive elements.

- **Backend & Smart Contracts:**  
  - Smart contracts are written in Solidity.
  - Deployed on EVM-compatible networks (e.g., Base Sepolia, Arbitrum Sepolia) using Hardhat.
  - Real-time data and game events are handled via on-chain events and integrated with the web UI.
  
- **AI & Integrations:**  
  - Off-chain AI (MrsBeauty) dynamically adjusts game parameters.
  - Multi-platform integrations (Telegram, Twitter) extend MrsBeauty's engagement capabilities.
  - ***Telegram Bot:*** [MrsBeautyBot](https://t.me/MrsBeautyBot)
  - ***Twitter:*** [@mrsbeauty71](https://x.com/mrsbeauty71)

## Deployed Contract Addresses

For details on deployed smart contract addresses, please refer to these snapshot files:

- **Arbitrum Sepolia:**  
[Deployed Addresses on Arbitrum Sepolia](https://github.com/lestrom/nostra-labs/blob/main/packages/contracts/ignition/deployments/chain-421614/deployed_addresses.json)

- **Base Sepolia:**  
[Deployed Addresses on Base Sepolia](https://github.com/lestrom/nostra-labs/blob/main/packages/contracts/ignition/deployments/chain-84532/deployed_addresses.json)


