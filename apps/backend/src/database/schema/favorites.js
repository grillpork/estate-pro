import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { properties } from "./property.js";
import { brands } from "./brands.js";

export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  brandId: integer("brand_id").references(() => brands.id),
  category: varchar("category", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});
