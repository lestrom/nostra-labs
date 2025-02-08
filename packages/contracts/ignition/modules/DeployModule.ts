// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { vars } from "hardhat/config";
import { network } from "hardhat";

const usdcContracts = {
  baseMainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  arbitrumMainnet: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};
const DeployModule = buildModule("DeployModule", (m) => {
  const networkName = network.name as keyof typeof usdcContracts;
  const usdcTokenAddress = usdcContracts[networkName];

  const nostraToken = m.contract("TestNostraToken", [10]);

  const entryFee = 10000;
  const burnPercent = 50;

  const stakingContract = m.contract(
    "StakingContract",
    [
      nostraToken,
      vars.get("DEPLOYER_PUBLIC_KEY"),
      vars.get("DEPLOYER_PUBLIC_KEY"),
      entryFee,
      burnPercent,
    ],
    {
      after: [nostraToken],
    }
  );

  const swapEscrowContract = m.contract(
    "SwapEscrow",
    [nostraToken, usdcTokenAddress],
    {
      after: [nostraToken],
    }
  );

  return { stakingContract, nostraToken, swapEscrowContract };
});

export default DeployModule;
