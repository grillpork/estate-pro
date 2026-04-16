import { integer, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const reports = pgTable("reports", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'website', 'user', 'property', 'other'
  targetId: varchar("target_id", { length: 255 }), // เก็บ ID ของสิ่งที่ถูกรายงาน (ถ้ามี)
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'resolved', 'dismissed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
