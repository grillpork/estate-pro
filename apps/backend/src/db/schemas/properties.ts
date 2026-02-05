import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";

const propState = pgEnum("prop_state", ["pending", "approved", "rejected"]);

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  floor: text("floor").notNull(),
  price: integer("price").notNull(),
  address: text("address").notNull(),
  image: text("image"),
  status: propState("status").notNull().default("pending"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

