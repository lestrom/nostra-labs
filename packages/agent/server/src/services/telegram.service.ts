import { Bot, webhookCallback } from "grammy";
import { BaseService } from "./base.service.js";
import { ElizaService } from "./eliza.service.js";

export class TelegramService extends BaseService {
  private static instance: TelegramService;
  private bot: Bot;
  private webhookUrl: string;
  public elizaService: ElizaService;

  private constructor(webhookUrl?: string) {
    super();
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    if (webhookUrl != null) {
      this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    }
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    this.elizaService = ElizaService.getInstance(this.bot);
  }

  public static getInstance(webhookUrl?: string): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService(webhookUrl);
    }
    return TelegramService.instance;
  }

  public async setWebhook(webhookUrl: string): Promise<void> {
    this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    await this.bot.api.setWebhook(this.webhookUrl);
    console.log("Telegram webhook set:", this.webhookUrl);
  }

  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    });
  }

  public async start(): Promise<void> {
    try {
      //all command descriptions can be added here
      this.bot.api.setMyCommands([
        {
          command: "subscribe",
          description: "Subscribe to the show",
        },
        { command: "unsubscribe", description: "Unsubscribe to the show" },
        { command: "message", description: "Talk to the AI agent" },
      ]);
      this.bot.catch(async (error) => {
        console.error("Telegram bot error:", error);
      });

      await this.elizaService.start();
    } catch (error) {
      console.error("Failed to start Telegram bot:", error);
      throw error;
    }
  }

  public sendMessage(chatId: string, message: string) {
    return this.bot.api.sendMessage(chatId, message);
  }

  public getBotInfo() {
    return this.bot.api.getMe();
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.api.deleteWebhook();
    } catch (error) {
      console.error("Error stopping Telegram bot:", error);
    }
  }
}
