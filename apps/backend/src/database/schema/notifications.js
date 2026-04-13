import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unread"),
  type: varchar("type", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});
