import { pgTable, text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

const reportStatus = pgEnum("report_status", ["pending", "in_progress", "resolved"]);

export const report = pgTable("report", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reportRelations = relations(report, ({ one }) => ({
    user: one(user, {
        fields: [report.userId],
        references: [user.id],
    }),
}));