// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from 'drizzle-orm'
import {
  integer,
  pgTable,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(name => `3ds_${name}`)

export const notes = pgTable('n4_note', {
  id: serial('id').primaryKey(),
  text: varchar('text').notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  body: varchar('body').notNull(),
  author: varchar('author', { length: 256 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
})

export const games = createTable('game', {
  id: varchar('id').notNull().primaryKey(),
  noteId: integer('note_id').references(() => notes.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
})

export const gamesRelations = relations(games, ({ one }) => ({
  note: one(notes, {
    fields: [games.noteId],
    references: [notes.id],
  }),
}))
