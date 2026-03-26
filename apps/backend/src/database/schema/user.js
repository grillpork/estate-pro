import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).unique(), // Increase length
  firstName: varchar("first_name", { length: 255 }), // Increase length
  lastName: varchar("last_name", { length: 255 }), // Increase length
  phoneNumber: varchar("phone_number", { length: 255 }), // Increase length
  roleId: integer("role_id").references(() => roles.id), // nullable: ป้องกัน data-loss บน rows เดิม
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(), // Increase length
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
