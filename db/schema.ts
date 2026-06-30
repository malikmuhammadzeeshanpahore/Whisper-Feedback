import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text().primaryKey(),
  recipientUsername: text("recipient_username").notNull(),
  text: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
