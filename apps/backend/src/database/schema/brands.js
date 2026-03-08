import { boolean, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const brandCategoryEnum = pgEnum("brand_category", [
  "DETACHED_HOUSE",
  "TWIN_HOUSE",
  "TOWNHOME",
  "CONDOMINIUM",
]);

export const brands = pgTable("brands", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  category: brandCategoryEnum("category"),
  isActive: boolean("is_active"),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

