import BaseSepoliaSwapEscrow from "../ignition/deployments/chain-84532/artifacts/DeployModule#SwapEscrow.json";
import BaseSepoliaStakingContract from "../ignition/deployments/chain-84532/artifacts/DeployModule#StakingContract.json";
import BaseSepoliaTestNostraToken from "../ignition/deployments/chain-84532/artifacts/DeployModule#TestNostraToken.json";

import ArbitrumSepoliaSwapEscrow from "../ignition/deployments/chain-421614/artifacts/DeployModule#SwapEscrow.json";
import ArbitrumSepoliaStakingContract from "../ignition/deployments/chain-421614/artifacts/DeployModule#StakingContract.json";
import ArbitrumSepoliaTestNostraToken from "../ignition/deployments/chain-421614/artifacts/DeployModule#TestNostraToken.json";

import { default as ArbitrumSepoliaDeployedAddresses } from "../ignition/deployments/chain-421614/deployed_addresses.json";
import { default as BaseSepoliaDeployedAddresses } from "../ignition/deployments/chain-84532/deployed_addresses.json";

const Networks = {
  84532: "BaseSepolia",
  421614: "ArbitrumSepolia",
};

const Deployments = {
  84532: {
    SwapEscrowABI: BaseSepoliaSwapEscrow.abi,
    StakingContractABI: BaseSepoliaStakingContract.abi,
    TestNostraTokenABI: BaseSepoliaTestNostraToken.abi,
    SwapEscrowAddress: BaseSepoliaDeployedAddresses["DeployModule#SwapEscrow"],
    StakingContractAddress:
      BaseSepoliaDeployedAddresses["DeployModule#StakingContract"],
    TestNostraTokenAddress:
      BaseSepoliaDeployedAddresses["DeployModule#TestNostraToken"],
  },
  421614: {
    SwapEscrowABI: ArbitrumSepoliaSwapEscrow.abi,
    StakingContractABI: ArbitrumSepoliaStakingContract.abi,
    TestNostraTokenABI: ArbitrumSepoliaTestNostraToken.abi,
    SwapEscrowAddress:
      ArbitrumSepoliaDeployedAddresses["DeployModule#SwapEscrow"],
    StakingContractAddress:
      ArbitrumSepoliaDeployedAddresses["DeployModule#StakingContract"],
    TestNostraTokenAddress:
      ArbitrumSepoliaDeployedAddresses["DeployModule#TestNostraToken"],
  },
  // 8453: {},
  // 42161: {},
} as const satisfies Record<keyof typeof Networks, Deployment>;

type Deployment = {
  SwapEscrowABI: any;
  StakingContractABI: any;
  TestNostraTokenABI: any;
  SwapEscrowAddress: string;
  StakingContractAddress: string;
  TestNostraTokenAddress: string;
};

export {
  BaseSepoliaSwapEscrow,
  BaseSepoliaStakingContract,
  BaseSepoliaTestNostraToken,
  ArbitrumSepoliaSwapEscrow,
  ArbitrumSepoliaStakingContract,
  ArbitrumSepoliaTestNostraToken,
  ArbitrumSepoliaDeployedAddresses,
  BaseSepoliaDeployedAddresses,
  Deployments,
  Networks,
};

export * from "./types/contracts";
