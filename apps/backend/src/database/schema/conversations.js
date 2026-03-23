import { integer, pgTable, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user.js'
import { properties } from './property.js'

export const conversations = pgTable('conversations', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  user1Id: integer('user1_id')
    .references(() => users.id)
    .notNull(),
  user2Id: integer('user2_id')
    .references(() => users.id)
    .notNull(),
  propertyId: integer('property_id').references(() => properties.id),

  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
})

