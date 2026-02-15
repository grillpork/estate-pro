import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const auditAction = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "ban",
  "unban",
  "verify",
]);

export const auditEntity = pgEnum("audit_entity", [
  "property",
  "user",
  "report",
  "admin",
  "system",
]);

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),

  // Admin ผู้ทำรายการ
  actorId: text("actor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // ทำอะไร (Action)
  action: auditAction("action").notNull(),

  // ทำกับอะไร (Entity Type)
  entityType: auditEntity("entity_type").notNull(),

  // ID ของสิ่งที่ถูกกระทำ (Target ID)
  // ไม่ทำเป็น FK เพื่อป้องกัน Integrity Error เวลาสิ่งที่ถูกทำรายการโดนลบไปแล้ว (Log ไม่ควรหายตาม)
  entityId: text("entity_id").notNull(),

  // รายละเอียดเพิ่มเติม (JSON) เช่น { previousStatus: "pending", newStatus: "approved", reason: "..." }
  details: jsonb("details"),

  // เวลาที่บันทึก
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(user, {
    fields: [auditLogs.actorId],
    references: [user.id],
  }),
}));
