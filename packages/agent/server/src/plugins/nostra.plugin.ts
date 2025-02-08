import { Plugin } from "@ai16z/eliza";
import { AnnounceGameEvent } from "./actions/announce-game-event.js";

export const announceGameEventPlugin: Plugin = {
  name: "announce-events",
  description: "Notify users on all platforms about on-chain events",
  actions: [new AnnounceGameEvent()],
};

export default announceGameEventPlugin;
