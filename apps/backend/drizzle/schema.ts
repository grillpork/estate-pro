import { pgTable, foreignKey, integer, text, varchar, timestamp, boolean, unique, type AnyPgColumn, numeric, jsonb, real, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const brandCategory = pgEnum("brand_category", ['DETACHED_HOUSE', 'TWIN_HOUSE', 'TOWNHOME', 'CONDOMINIUM'])
export const listingType = pgEnum("listing_type", ['SALES', 'RENT', 'SALE & RENT'])
export const propertyStatus = pgEnum("property_status", ['pending', 'approved', 'rejected'])


export const messages = pgTable("messages", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "messages_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	conversationId: integer("conversation_id").notNull(),
	senderId: integer("sender_id"),
	content: text().notNull(),
	messageType: varchar("message_type", { length: 20 }).default('text'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
]);

export const userSubscriptions = pgTable("user_subscriptions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_subscriptions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id"),
	planId: integer("plan_id"),
	billingCycle: varchar("billing_cycle", { length: 50 }),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: varchar({ length: 50 }),
	autoRenew: boolean("auto_renew"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_subscriptions_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [membershipPlans.id],
			name: "user_subscriptions_plan_id_membership_plans_id_fk"
		}),
]);

export const reports = pgTable("reports", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "reports_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	reporterId: integer("reporter_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	targetId: varchar("target_id", { length: 255 }),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "reports_reporter_id_users_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "notifications_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id"),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	status: varchar({ length: 20 }).default('unread').notNull(),
	type: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	phoneNumber: varchar("phone_number", { length: 255 }),
	roleId: integer("role_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	imagePath: varchar("image_path", { length: 255 }),
	lastSeen: timestamp("last_seen", { mode: 'string' }),
	verification: varchar({ length: 20 }).default('unverified'),
	resetToken: varchar("reset_token", { length: 255 }),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_roles_id_fk"
		}),
	unique("users_email_unique").on(table.email),
]);

export const properties = pgTable("properties", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "properties_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	startingPrice: numeric("starting_price", { precision: 15, scale:  2 }).notNull(),
	rentPrice: numeric("rent_price", { precision: 15, scale:  2 }),
	projectArea: varchar("project_area", { length: 255 }),
	landArea: numeric("land_area", { precision: 15, scale:  2 }),
	usableArea: varchar("usable_area", { length: 255 }),
	totalUnits: integer("total_units"),
	parkingSpaces: integer("parking_spaces"),
	parkingPercent: numeric("parking_percent", { precision: 5, scale:  2 }),
	studio: integer(),
	bedrooms: integer(),
	bathrooms: integer(),
	floor: integer(),
	building: varchar({ length: 255 }),
	commonFee: numeric("common_fee", { precision: 10, scale:  2 }),
	estimatedInstallment: numeric("estimated_installment", { precision: 15, scale:  2 }),
	province: varchar({ length: 255 }),
	district: varchar({ length: 255 }),
	subDistrict: varchar("sub_district", { length: 255 }),
	zipCode: varchar("zip_code", { length: 20 }),
	facing: varchar({ length: 100 }),
	latitude: numeric({ precision: 18, scale:  10 }),
	longitude: numeric({ precision: 18, scale:  10 }),
	ownerName: varchar("owner_name", { length: 255 }),
	ownerPhone: varchar("owner_phone", { length: 20 }),
	availableDate: timestamp("available_date", { mode: 'string' }),
	brandId: integer("brand_id"),
	userId: integer("user_id"),
	listingType: listingType("listing_type"),
	discount: numeric({ precision: 15, scale:  2 }),
	discountActive: boolean("discount_active").default(true).notNull(),
	discountType: varchar("discount_type", { length: 10 }).default('BAHT').notNull(),
	rentDiscount: numeric("rent_discount", { precision: 15, scale:  2 }),
	rentDiscountActive: boolean("rent_discount_active").default(false).notNull(),
	rentDiscountType: varchar("rent_discount_type", { length: 10 }).default('BAHT').notNull(),
	rentNetTotal: numeric("rent_net_total", { precision: 15, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	amenities: jsonb(),
	imageId: integer("image_id"),
	status: propertyStatus().default('pending').notNull(),
	rejectionReason: text("rejection_reason"),
	saleNetTotal: numeric("sale_net_total", { precision: 15, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "properties_brand_id_brands_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "properties_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.imageId],
			foreignColumns: [propertyImages.id],
			name: "properties_image_id_property_images_id_fk"
		}),
]);

export const brands = pgTable("brands", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "brands_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }),
	category: brandCategory(),
	isActive: boolean("is_active"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const landmarks = pgTable("landmarks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "landmarks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }),
	latitude: real(),
	longitude: real(),
	color: varchar({ length: 50 }),
	line: varchar({ length: 100 }),
	type: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const membershipPlans = pgTable("membership_plans", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "membership_plans_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }),
	description: text(),
	priceMonthly: numeric("price_monthly", { precision: 10, scale:  2 }),
	priceYearly: numeric("price_yearly", { precision: 10, scale:  2 }),
	maxListings: integer("max_listings"),
	canChat: boolean("can_chat"),
	canViewOwnerContact: boolean("can_view_owner_contact"),
	isActive: boolean("is_active"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const roles = pgTable("roles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const conversations = pgTable("conversations", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "conversations_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	user1Id: integer("user1_id").notNull(),
	user2Id: integer("user2_id").notNull(),
	propertyId: integer("property_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user1Id],
			foreignColumns: [users.id],
			name: "conversations_user1_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.user2Id],
			foreignColumns: [users.id],
			name: "conversations_user2_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "conversations_property_id_properties_id_fk"
		}),
]);

export const favorites = pgTable("favorites", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "favorites_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer("user_id"),
	propertyId: integer("property_id"),
	brandId: integer("brand_id"),
	category: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "favorites_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "favorites_property_id_properties_id_fk"
		}),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "favorites_brand_id_brands_id_fk"
		}),
]);

export const propertyImages = pgTable("property_images", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "property_images_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	propertyId: integer("property_id"),
	imagePath: varchar("image_path", { length: 255 }),
	isMain: boolean("is_main").default(false).notNull(),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_images_property_id_properties_id_fk"
		}),
]);
