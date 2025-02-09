import { ElizaService } from "./eliza.service.js";
import dotenv from "dotenv";
import { BaseService } from "./base.service.js";
import {
  Deployments,
  StakingContract__factory,
  TestNostraToken__factory,
} from "../../../../contracts/dist/index.js";
import { ethers } from "ethers";
import {
  composeContext,
  Content,
  generateMessageResponse,
  messageCompletionFooter,
  ModelClass,
} from "@ai16z/eliza";
import { randomUUID } from "crypto";

dotenv.config();

const telegramMessageHandlerTemplate =
  // {{goals}}
  `# Action Names
{{actionNames}}

# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate game updates in the character of {{agentName}}. Use the provided context to generate a post on the game progress. Use TNST token instead of ETH in the post. Use 18 decimals for the token amounts, do the unit conversion before posting.
About {{agentName}}:
{{bio}}
{{lore}}

Examples of {{agentName}}'s dialog and actions:
{{messageExamples}}

{{providers}}

{{attachments}}

{{actions}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

# Task: Generate a post/reply in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}) while using the thread of tweets as additional context:
Current Post:
{{currentPost}}
Thread of Tweets You Are Replying To:

{{formattedConversation}}
` + messageCompletionFooter;

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
  private userId = randomUUID();
  private roomId = randomUUID();
  private agentId = randomUUID();

  private constructor(elizaService: ElizaService) {
    super();
    this.elizaService = elizaService;
  }

  get runtime() {
    return this.elizaService.getRuntime();
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

  private transformEventToMessage(
    eventName: string,
    params: Record<string, string>
  ): Content {
    return {
      text: `Received a smart contract event ${eventName} with the following parameters:\n\n${JSON.stringify(params, null, 2)}\n\nplease notify users on all platform about this update (ANNOUNCE_GAME_EVENT)`,
      source: "telegram",
      inReplyTo: undefined,
    };
  }

  private subscribeToStakingEvents(
    config: NetworkConfig,
    // eslint-disable-next-line no-unused-vars
    callback: (msg: Content) => void
  ): void {
    const { rpc } = config;
    const provider = new ethers.JsonRpcProvider(rpc);

    const stakingContract = StakingContract__factory.connect(
      config.StakingContractAddress,
      {
        provider,
      }
    );

    stakingContract.on(stakingContract.getEvent("Staked"), (user, amount) =>
      callback(
        this.transformEventToMessage("User Stake (entered the arena)", {
          user,
          amount: amount.toString(),
        })
      )
    );

    stakingContract.on(stakingContract.getEvent("Unstaked"), (user, amount) =>
      callback(
        this.transformEventToMessage("User Unstaked (left the arena)", {
          user,
          amount: amount.toString(),
        })
      )
    );

    this.logger.log("Attached 'StakingContract.Staked' event listeners...");
  }

  private subscribeToMintEvents(
    config: NetworkConfig,
    callback: (msg: Content) => void
  ): void {
    const { rpc } = config;
    const provider = new ethers.JsonRpcProvider(rpc);

    const stakingContract = TestNostraToken__factory.connect(
      config.StakingContractAddress,
      { provider }
    );

    const event = stakingContract.getEvent("Transfer");
    stakingContract.on(event, (from, to, value) => {
      callback(
        this.transformEventToMessage("Mint Game Tokens", {
          from,
          to,
          value: value.toString(),
        })
      );
    });

    this.logger.log("Attached 'TestNostraToken.Transfer' event listeners...");
  }

  private async forwardMessageToEliza(msg: Content) {
    try {
      const memory = await this.runtime.messageManager.addEmbeddingToMemory({
        content: msg,
        userId: this.userId,
        roomId: this.roomId,
        agentId: this.runtime.agentId,
      });
      // set unique to avoid duplicating memories
      await this.runtime.messageManager.createMemory(memory, true);
      // Update state with the new memory
      let state = await this.runtime.composeState(memory);
      state = await this.runtime.updateRecentMessageState(state);

      const context = composeContext({
        state,
        template:
          this.runtime.character.templates?.telegramMessageHandlerTemplate ||
          this.runtime.character?.templates?.messageHandlerTemplate ||
          telegramMessageHandlerTemplate,
      });

      const responseContent = await generateMessageResponse({
        runtime: this.runtime,
        context,
        modelClass: ModelClass.MEDIUM,
      });

      await this.runtime.databaseAdapter.log({
        body: { msg, context, responseContent },
        userId: this.userId,
        roomId: this.roomId,
        type: "response",
      });

      this.logger.log("[eliza.service] processing resulting actions");

      const responseMessage = {
        content: responseContent,
        userId: this.userId,
        roomId: this.roomId,
        agentId: this.agentId,
      };
      console.log(responseMessage);
      // Handle the message with ElizaService
      await this.runtime.processActions(responseMessage, [responseMessage]);
    } catch (error) {
      console.error("Failed to process event:", error);
    }
  }

  public async start(): Promise<void> {
    this.logger.log("Attaching event listener handlers...");

    Object.entries(CONFIG)
      .filter(([, config]) => config.rpc !== undefined)
      .forEach(async ([, config]) => {
        this.subscribeToStakingEvents(config, async (msg) => {
          await this.forwardMessageToEliza(msg);
          console.log("Staked event received");
        });
        this.subscribeToMintEvents(config, async (msg) => {
          await this.forwardMessageToEliza(msg);
          console.log("Mint event received");
        });
      });
  }

  public async stop(): Promise<void> {}
}
