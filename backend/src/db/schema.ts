import { relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  bigint,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const cardStateEnum = pgEnum("card_state", [
  "new",
  "learning",
  "review",
  "suspended",
]);

export const cardRatingEnum = pgEnum("card_rating", [
  "again",
  "hard",
  "good",
  "easy",
]);

export const users = pgTable("users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    email: text("email").notNull(),
    username: text("username").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const decks = pgTable("decks",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),

    parentDeckId: uuid("parent_deck_id").references(
      (): AnyPgColumn => decks.id,
      { onDelete: "set null", onUpdate: "cascade" },
    ),

    name: text("name").notNull(),
    description: text("description"),
    tags: text("tags").array(),
    color: text("color"),
    icon: text("icon"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIndex: index("decks_user_id_idx").on(table.userId),
    parentDeckIdIndex: index("decks_parent_deck_id_idx").on(
      table.parentDeckId,
    ),
  }),
);

export const cards = pgTable("cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    deckId: uuid("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade", onUpdate: "cascade" }),

    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    tags: text("tags").array(),

    state: cardStateEnum("state").notNull().default("new"),

    due: timestamp("due", { withTimezone: true }).notNull().defaultNow(),

    rating: cardRatingEnum("rating"),

    totalReviews: bigint("total_reviews", { mode: "number" })
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    deckIdIndex: index("cards_deck_id_idx").on(table.deckId),

    deckDueIndex: index("cards_deck_id_due_idx").on(
      table.deckId,
      table.due,
    ),

    deckStateDueIndex: index("cards_deck_id_state_due_idx").on(
      table.deckId,
      table.state,
      table.due,
    ),
  }),
);

export const dateData = pgTable("date_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),

    date: date("date").notNull().default(sql`date(now())`),

    easy: bigint("easy", { mode: "number" }).notNull().default(0),
    medium: bigint("medium", { mode: "number" }).notNull().default(0),
    hard: bigint("hard", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    userDateUnique: uniqueIndex("date_data_user_id_date_unique").on(
      table.userId,
      table.date,
    ),

    userIdIndex: index("date_data_user_id_idx").on(table.userId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  dateData: many(dateData),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),

  parentDeck: one(decks, {
    fields: [decks.parentDeckId],
    references: [decks.id],
    relationName: "deckHierarchy",
  }),

  childDecks: many(decks, {
    relationName: "deckHierarchy",
  }),

  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
}));

export const dateDataRelations = relations(dateData, ({ one }) => ({
  user: one(users, {
    fields: [dateData.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Deck = typeof decks.$inferSelect;
export type NewDeck = typeof decks.$inferInsert;

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

export type DateData = typeof dateData.$inferSelect;
export type NewDateData = typeof dateData.$inferInsert;