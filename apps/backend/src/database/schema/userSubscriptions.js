import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { membershipPlans } from "./membershipPlans.js";

export const userSubscriptions = pgTable("user_subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  planId: integer("plan_id").references(() => membershipPlans.id),
  billingCycle: varchar("billing_cycle", { length: 50 }),
  startDate: timestamp("start_date", { withTimezone: false }),
  endDate: timestamp("end_date", { withTimezone: false }),
  status: varchar("status", { length: 50 }),
  autoRenew: boolean("auto_renew"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});
