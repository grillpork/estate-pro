import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const notificationStatusEnum = pgEnum("notification_status", [
  "read",
  "unread",
]);

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").default("unread").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
