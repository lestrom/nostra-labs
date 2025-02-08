export const sqliteSessionTables = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Table: sessions
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "subscribed" INTEGER NOT NULL DEFAULT 0,
    UNIQUE(chatId)
);

-- Index: sessions_chat_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_chat_id_key" ON "sessions" ("chatId");

COMMIT;`;

import { Database } from "better-sqlite3";

export interface Session {
  id?: string;
  name: string;
  chatId: string;
  subscribed: boolean;
  createdAt?: number;
}

export class SqliteSessionAdapter {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async init(): Promise<void> {
    this.db.exec(sqliteSessionTables);
  }

  async createSession(session: Session): Promise<boolean> {
    try {
      const sql = `
        INSERT INTO sessions (name, chatId, subscribed)
        VALUES (?, ?, ?)
      `;

      this.db
        .prepare(sql)
        .run(session.name, session.chatId, session.subscribed ? 1 : 0);

      return true;
    } catch (error) {
      console.log("Error creating session", error);
      return false;
    }
  }

  async getSessionByChatId(chatId: string): Promise<Session | null> {
    const sql = "SELECT * FROM sessions WHERE chatId = ?";
    const session = this.db.prepare(sql).get(chatId) as Session;

    if (!session) return null;

    return {
      ...session,
      subscribed: Boolean(session.subscribed),
      createdAt:
        typeof session.createdAt === "string"
          ? Date.parse(session.createdAt)
          : session.createdAt,
    };
  }

  async updateSession(
    chatId: string,
    session: Partial<Session>
  ): Promise<boolean> {
    try {
      const existingSession = (await this.getSessionByChatId(
        chatId
      )) as Session;
      if (!existingSession) return false;

      const updates: string[] = [];
      const values: unknown[] = [];

      if (session.name !== undefined) {
        updates.push("name = ?");
        values.push(session.name);
      }

      if (session.chatId !== undefined) {
        updates.push("chatId = ?");
        values.push(session.chatId);
      }

      if (session.subscribed !== undefined) {
        updates.push("subscribed = ?");
        values.push(session.subscribed ? 1 : 0);
      }

      if (updates.length === 0) return true;

      const sql = `
        UPDATE sessions
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      values.push(session.id);
      this.db.prepare(sql).run(...values);

      return true;
    } catch (error) {
      console.log("Error updating session", error);
      return false;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sql = "DELETE FROM sessions WHERE id = ?";
      this.db.prepare(sql).run(sessionId);
      return true;
    } catch (error) {
      console.log("Error deleting session", error);
      return false;
    }
  }

  async getAllSessions(): Promise<Session[]> {
    const sql = "SELECT * FROM sessions ORDER BY createdAt DESC";
    const sessions = this.db.prepare(sql).all() as Session[];

    return sessions.map((session) => ({
      ...session,
      subscribed: Boolean(session.subscribed),
      createdAt:
        typeof session.createdAt === "string"
          ? Date.parse(session.createdAt)
          : session.createdAt,
    }));
  }

  async getSubscribedSessions(): Promise<Session[]> {
    const sql =
      "SELECT * FROM sessions WHERE subscribed = 1 ORDER BY createdAt DESC";
    const sessions = this.db.prepare(sql).all() as Session[];

    return sessions.map((session) => ({
      ...session,
      subscribed: true,
      createdAt:
        typeof session.createdAt === "string"
          ? Date.parse(session.createdAt)
          : session.createdAt,
    }));
  }
}
