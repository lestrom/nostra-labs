import { ElizaService } from "./eliza.service.js";
import dotenv from "dotenv";
import { BaseService } from "./base.service.js";
import {
  Deployments,
  StakingContract__factory,
  TestNostraToken__factory,
} from "../../../../contracts/dist/index.js";
import { Context } from "grammy";

dotenv.config();

const CONFIG = {
  421614: {
    name: "Arbitrum Sepolia",
    rpc: process.env.ARB_SEPOLIA_RPC_URL,
    ...Deployments["421614"],
  },
  84532: {
    name: "Base Sepolia",
    rpc: process.env.BASE_SEPOLIA_RPC_URL,
    ...Deployments["84532"],
  },
  // Arbitrum: {
  //   rpc: process.env.ARB_RPC_URL,
  //   ...Deployments["42161"],
  // },
  // Base: {
  //   rpc: process.env.BASE_RPC_URL,
  //   ...Deployments["8453"],
  // },
};

type ChainId = keyof typeof CONFIG;
type NetworkConfig = (typeof CONFIG)[ChainId];

class Logger {
  public serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  public log(message: string): void {
    console.log(`[${this.serviceName}]: ${message}`);
  }
}

export class ContractMonitorService extends BaseService {
  private static instance: ContractMonitorService;
  private elizaService: ElizaService;
  private logger = new Logger("ContractMonitorService");

  private constructor(elizaService: ElizaService) {
    super();
    this.elizaService = elizaService;
  }

  public static getInstance(
    elizaService: ElizaService
  ): ContractMonitorService {
    if (!ContractMonitorService.instance) {
      ContractMonitorService.instance = new ContractMonitorService(
        elizaService
      );
    }
    return ContractMonitorService.instance;
  }

  private transformEventToContext(
    eventName: string,
    params: Record<string, string>
  ): Context {
    const ctx = {
      message: {
        text: `Received a smart contract event ${eventName}
        with the following parameters:

        ${JSON.stringify(params)}

        please notify users on all platform about this update (ANNOUNCE_GAME_EVENT)
        `,
        from: { id: 1, is_bot: false, first_name: "System" },
        chat: { id: 1, type: "private" },
        date: Math.floor(Date.now() / 1000),
        message_id: Math.floor(Math.random() * 1000000),
      },
      from: { id: 1, is_bot: false, first_name: "System" },
      chat: { id: 1, type: "private" },
    } as unknown as Context;

    return ctx;
  }

  private subscribeToStakingEvents(
    config: NetworkConfig,
    // eslint-disable-next-line no-unused-vars
    callback: (msg: Context) => void
  ): void {
    // const { rpc } = config;
    // const provider = new ethers.JsonRpcProvider(rpc);

    const stakingContract = StakingContract__factory.connect(
      config.StakingContractAddress
    );

    const event = stakingContract.getEvent("Staked");
    stakingContract.on(event, (user, amount) =>
      callback(
        this.transformEventToContext("Transfer", {
          user,
          amount: amount.toString(),
        })
      )
    );

    this.logger.log("Attached 'StakingContract.Staked' event listeners...");
  }

  private subscribeToMintEvents(
    config: NetworkConfig,
    callback: (msg: Context) => void
  ): void {
    // const { rpc } = config;
    // const provider = new ethers.JsonRpcProvider(rpc);

    const stakingContract = TestNostraToken__factory.connect(
      config.StakingContractAddress
    );

    const event = stakingContract.getEvent("Transfer");
    stakingContract.on(event, (from, to, value) => {
      callback(
        this.transformEventToContext("Transfer", {
          from,
          to,
          value: value.toString(),
        })
      );
    });

    this.logger.log("Attached 'TestNostraToken.Transfer' event listeners...");
  }

  public async start(): Promise<void> {
    this.logger.log("Attaching event listener handlers...");

    Object.entries(CONFIG)
      .filter(([, config]) => config.rpc !== undefined)
      .forEach(async ([, config]) => {
        const forwardMessageToEliza = async (msg: Context) => {
          try {
            // Handle the message with ElizaService
            await this.elizaService.messageManager.handleMessage(msg);
          } catch (error) {
            console.error("Failed to process event:", error);
          }
        };
        this.subscribeToStakingEvents(config, async (msg) => {
          await forwardMessageToEliza(msg);
          console.log("Staked event received");
        });
        this.subscribeToMintEvents(config, async (msg) => {
          await forwardMessageToEliza(msg);
          console.log("Mint event received");
        });
      });
  }

  public async stop(): Promise<void> {}
}
