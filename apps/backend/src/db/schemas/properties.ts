import { integer, pgTable, text } from "drizzle-orm/pg-core";


export const properties = pgTable("properties", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    floor : text("floor").notNull(),
    price: integer("price").notNull(),
    address: text("address").notNull(),
    image: text("image"),
    // userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    



});
