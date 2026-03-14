import { integer, pgTable, varchar, real, timestamp } from "drizzle-orm/pg-core";

export const landmarks = pgTable("landmarks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  color: varchar("color", { length: 50 }),
  line: varchar("line", { length: 100 }),
  type: varchar("type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
