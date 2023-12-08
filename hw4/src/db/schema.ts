import { relations } from "drizzle-orm";
import {
  index,
  text,
  pgTable,
  serial,
  uuid,
  varchar,
  unique,
  integer,
} from "drizzle-orm/pg-core";

// Checkout the many-to-many relationship in the following tutorial:
// https://orm.drizzle.team/docs/rqb#many-to-many

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 100 }),
    provider: varchar("provider", {
      length: 100,
      enum: ["github", "credentials"],
    })
      .notNull()
      .default("credentials"),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    usernameIndex: index("username_index").on(table.username),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  chatroomsTable: many(chatroomsTable),
}));

export const chatroomsTable: any = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    user1name: varchar("user1name", { length: 100 })
      .notNull()
      .references(() => usersTable.username, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user2name: varchar("user2name", { length: 100 })
      .notNull()
      .references(() => usersTable.username, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    pinnedMessageId: integer("pinned_message_id").references(
      () => messagesTable.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      },
    ),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    user1nameIndex: index("user1name_index").on(table.user1name),
    user2nameIndex: index("user2name_index").on(table.user2name),
    uniqCombination: unique().on(table.user1name, table.user2name),
  }),
);

export const chatroomsRelations = relations(chatroomsTable, ({ many }) => ({
  messagesTable: many(messagesTable),
}));

export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    chatroomID: uuid("chatroomID")
      .notNull()
      .references(() => chatroomsTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    sender: varchar("sender", { length: 100 })
      .notNull()
      .references(() => usersTable.username, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    message: text("message").notNull(),
    validity: varchar("validity", { length: 20 }).notNull().default("valid"),
    //.check(`"validity" IN ('valid', 'invalid', 'senderInvalid')`),
  },
  (table) => ({
    chatroomIDIndex: index("chatroom_id_index").on(table.chatroomID),
  }),
);
