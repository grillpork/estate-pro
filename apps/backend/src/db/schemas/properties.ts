import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { title } from "node:process";

export const properties = pgTable("properties", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    floor : text("floor").notNull(),
    price: integer("price").notNull(),
    address: text("address").notNull(),
    // userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    



});
