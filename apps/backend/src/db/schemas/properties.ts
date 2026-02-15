import {
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const propState = pgEnum("prop_state", [
  "pending",
  "approved",
  "rejected",
]);
export const propType = pgEnum("prop_type", ["rent", "sale"]);

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  floor: text("floor").notNull(),
  price: integer("price").notNull(),
  address: text("address").notNull(),
  image: text("image"),
  //สถานะของอสังหา
  status: propState("status").default("pending").notNull(),
  //ประเภทของอสังหา ขายหรือเช่า
  type: propType("type").default("rent").notNull(),
  // amenities: text("amenities").array(),
  amenities: json("amenities").$type<string[]>().default([]),
  //เหตุผลที่ปฏิเสธ
  rejectionReason: text("rejection_reason"),
  //เจ้าของ
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  //วันเวลาที่สร้าง
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  //วันเวลาที่อัปเดต
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const propertyRelations = relations(properties, ({ one }) => ({
  //Many to one :อสังหา 1 หลัง ต่อ user 1 คน
  Owner: one(user, {
    fields: [properties.userId],
    references: [user.id],
  }),
}));
