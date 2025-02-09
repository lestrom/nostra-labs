import { Handler } from "@ai16z/eliza";
import { CollabLandBaseAction } from "./collabland.action.js";
import { sessionDatabase } from "../../db/index.js";
import { TelegramService } from "../../services/telegram.service.js";
import { TwitterService } from "../../services/twitter.service.js";

export class AnnounceGameEvent extends CollabLandBaseAction {
  constructor() {
    const description =
      "Announce game progress on all channels. Call this action if you see a prompt with the following format: 'Received a smart contract event {eventName} with the following parameters:\n\n{parameters}'";
    const name = "ANNOUNCE_GAME_EVENT";
    const similes = [
      "SHARE_GAME_EVENT",
      "NOTIFY_GAME_EVENT",
      "BROADCAST_GAME_EVENT",
    ];
    const examples = [
      [
        {
          user: "1",
          content: {
            type: "text",
            text: "Received a smart contract event {eventName} with the following parameters:\n\n{parameters}",
          },
        },
        {
          user: "1",
          content: {
            type: "text",
            text: "User {{userid}} unstaked 1000 $TNST tokens",
          },
        },
        {
          user: "1",
          content: {
            type: "text",
            text: "User {{userid}} entered round 2",
          },
        },
        {
          user: "1",
          content: {
            type: "text",
            text: "User {{userid}} left round 2",
          },
        },
      ],
    ];

    const handler: Handler = async (_runtime, _message): Promise<boolean> => {
      try {
        const message = _message.content.text;
        console.log("Announcing game event:", message);

        const telegramSubscriptions = await sessionDatabase.getSubscribers();
        console.log(telegramSubscriptions);
        for (const subscription of telegramSubscriptions) {
          await TelegramService.getInstance().sendMessage(
            subscription.chatId,
            message
          );
        }

        await TwitterService.getInstance().sendTweet(message);

        console.log("Game event announced successfully");
        return true;
      } catch (error) {
        console.error("Failed to announce game event:", error);
        return false;
      }
    };

    super(name, description, similes, examples, handler, async () => true);
  }
}
