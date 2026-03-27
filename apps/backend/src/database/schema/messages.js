import { integer, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { users } from "./user.js";

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: integer("sender_id")
    .references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default('text'), // 'text', 'image', etc.
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});
