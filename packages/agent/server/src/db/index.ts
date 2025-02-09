import { elizaLogger } from "@ai16z/eliza";
import Database from "better-sqlite3";
import { SqliteSessionAdapter } from "./adapter.js";

class SessionDb {
  private db: SqliteSessionAdapter;
  constructor() {
    // Initialize SQLite adapter
    const db = new SqliteSessionAdapter(new Database("session.db"));
    this.db = db;
  }

  public async init() {
    return this.db
      .init()
      .then(() => {
        elizaLogger.info("Session database initialized.");
      })
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        throw error;
      });
  }

  public async getSubscribers() {
    // Implement this method to get all subscribers
    return this.db.getSubscribedSessions();
  }

  public async hasSubscriber(chatId: string) {
    return Boolean(await this.db.getSessionByChatId(chatId));
  }

  removeSubscriber(chatId: string) {
    return this.db.deleteSession(chatId);
  }

  addSubscriber(chatId: string, name: string) {
    return this.db.createSession({ chatId, name, subscribed: true });
  }
}

export const sessionDatabase = new SessionDb();
