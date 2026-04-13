import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  jsonb,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { brands } from "./brands.js";
import { users } from "./user.js";

export const occupancyEnum = pgEnum("occupancy", [
  "VACANT",
  "OCCUPIED",
]);
export const listingTypeEnum = pgEnum("listing_type", [
  "SALES",
  "RENT",
  "SALE & RENT",
]);
export const propertyStatusEnum = pgEnum("property_status", [
  "pending",
  "approved",
  "rejected",
]);

export const properties = pgTable("properties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageId: integer("image_id").references(() => propertyImages.id),
  startingPrice: numeric("starting_price", { precision: 15, scale: 2 }).notNull(),
  rentPrice: numeric("rent_price", { precision: 15, scale: 2 }),
  projectArea: varchar("project_area", { length: 255 }),
  landArea: numeric("land_area", { precision: 15, scale: 2 }),
  usableArea: varchar("usable_area", { length: 255 }),
  totalUnits: integer("total_units"),
  parkingSpaces: integer("parking_spaces"),
  parkingPercent: numeric("parking_percent", { precision: 5, scale: 2 }),
  studio: integer("studio"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  floor: integer("floor"),
  building: varchar("building", { length: 255 }),
  commonFee: numeric("common_fee", { precision: 10, scale: 2 }),
  estimatedInstallment: numeric("estimated_installment", {
    precision: 15,
    scale: 2,
  }),
  province: varchar("province", { length: 255 }),
  district: varchar("district", { length: 255 }),
  subDistrict: varchar("sub_district", { length: 255 }),
  zipCode: varchar("zip_code", { length: 20 }),
  facing: varchar("facing", { length: 100 }),
  latitude: numeric("latitude", { precision: 18, scale: 10 }),
  longitude: numeric("longitude", { precision: 18, scale: 10 }),
  occupancy: occupancyEnum("occupancy"),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerPhone: varchar("owner_phone", { length: 20 }),
  availableDate: timestamp("available_date", { withTimezone: false }),
  brandId: integer("brand_id").references(() => brands.id),
  userId: integer("user_id").references(() => users.id),
  amenities: jsonb("amenities"),
  listingType: listingTypeEnum("listing_type"),
  discount: numeric("discount", { precision: 15, scale: 2 }),
  discountActive: boolean("discount_active").notNull().default(true),
  discountType: varchar("discount_type", { length: 10 }).notNull().default("BAHT"),
  rentDiscount: numeric("rent_discount", { precision: 15, scale: 2 }),
  rentDiscountActive: boolean("rent_discount_active").notNull().default(false),
  rentDiscountType: varchar("rent_discount_type", { length: 10 })
    .notNull()
    .default("BAHT"),
  rentNetTotal: numeric("rent_net_total", { precision: 15, scale: 2 }),
  status: propertyStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  condition: integer("condition").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});

export const propertyImages = pgTable("property_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  propertyId: integer("property_id").references(() => properties.id),
  imagePath: varchar("image_path", { length: 255 }),
  isMain: boolean("is_main").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }),
});