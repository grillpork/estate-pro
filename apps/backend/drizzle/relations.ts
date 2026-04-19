import { relations } from "drizzle-orm/relations";
import { conversations, messages, users, userSubscriptions, membershipPlans, reports, notifications, roles, brands, properties, propertyImages, favorites } from "./schema";

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	messages: many(messages),
	user_user1Id: one(users, {
		fields: [conversations.user1Id],
		references: [users.id],
		relationName: "conversations_user1Id_users_id"
	}),
	user_user2Id: one(users, {
		fields: [conversations.user2Id],
		references: [users.id],
		relationName: "conversations_user2Id_users_id"
	}),
	property: one(properties, {
		fields: [conversations.propertyId],
		references: [properties.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	messages: many(messages),
	userSubscriptions: many(userSubscriptions),
	reports: many(reports),
	notifications: many(notifications),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	properties: many(properties),
	conversations_user1Id: many(conversations, {
		relationName: "conversations_user1Id_users_id"
	}),
	conversations_user2Id: many(conversations, {
		relationName: "conversations_user2Id_users_id"
	}),
	favorites: many(favorites),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id]
	}),
	membershipPlan: one(membershipPlans, {
		fields: [userSubscriptions.planId],
		references: [membershipPlans.id]
	}),
}));

export const membershipPlansRelations = relations(membershipPlans, ({many}) => ({
	userSubscriptions: many(userSubscriptions),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	user: one(users, {
		fields: [reports.reporterId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	users: many(users),
}));

export const propertiesRelations = relations(properties, ({one, many}) => ({
	brand: one(brands, {
		fields: [properties.brandId],
		references: [brands.id]
	}),
	user: one(users, {
		fields: [properties.userId],
		references: [users.id]
	}),
	propertyImage: one(propertyImages, {
		fields: [properties.imageId],
		references: [propertyImages.id],
		relationName: "properties_imageId_propertyImages_id"
	}),
	conversations: many(conversations),
	favorites: many(favorites),
	propertyImages: many(propertyImages, {
		relationName: "propertyImages_propertyId_properties_id"
	}),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	properties: many(properties),
	favorites: many(favorites),
}));

export const propertyImagesRelations = relations(propertyImages, ({one, many}) => ({
	properties: many(properties, {
		relationName: "properties_imageId_propertyImages_id"
	}),
	property: one(properties, {
		fields: [propertyImages.propertyId],
		references: [properties.id],
		relationName: "propertyImages_propertyId_properties_id"
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [favorites.propertyId],
		references: [properties.id]
	}),
	brand: one(brands, {
		fields: [favorites.brandId],
		references: [brands.id]
	}),
}));