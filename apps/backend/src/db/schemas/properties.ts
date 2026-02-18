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
export const propCategory = pgEnum("prop_category", [
  "house",
  "condo",
  "land",
]);
export const furnitureStatus = pgEnum("furniture_status", [
  "complete",
  "partial",
  "empty",
]);

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  floor: text("floor").notNull(),
  bedroom: integer("bedroom").notNull(),
  bathroom: integer("bathroom").notNull(),
  size: integer("size").notNull(),
  price: integer("price").notNull(),
  address: text("address").notNull(),
  image: text("image"),
  //สถานะของอสังหา
  status: propState("status").default("pending").notNull(),
  //ประเภทของอสังหา ขายหรือเช่า
  type: propType("type").default("rent").notNull(),
  //ประเภทอสังหาริมทรัพย์ บ้าน คอนโด ที่ดิน
  category: propCategory("category").default("house").notNull(),
  //สถานะเฟอร์นิเจอร์/การตกแต่ง ครบ บางส่วน ว่าง
  furnitureStatus: furnitureStatus("furniture_status").default("empty").notNull(),
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
