// import { Router, Request, Response } from "express";
// import { TwitterService } from "../services/twitter.service.js";

// const router = Router();

// const tweet = async (req: Request, res: Response) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       res.status(400).json({ error: "Message is required" });
//       return;
//     }

//     const twitterService = TwitterService.getInstance();
//     const twitterClient = twitterService.getScraper();
//     const tweetResponse = await twitterClient.sendTweet(message);

//     res.json({ success: true, tweetResponse });
//   } catch (error) {
//     console.error("Failed to send tweet:", error);
//     res.status(500).json({ error: "Failed to send tweet" });
//   }
// };

// const handleMessage = async (req: Request, res: Response) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       res.status(400).json({ error: "Message is required" });
//       return;
//     }
//     const telegramService = TelegramService.getInstance();
//     const twitterService = ElizaService.getInstance(telegramService);
//     const tweetResponse = await twitterClient.sendMessage(message);

//     res.json({ success: true, tweetResponse });
//   } catch (error) {
//     console.error("Failed to send message:", error);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };

// router.use("/tweet", tweet);

// export default router;
