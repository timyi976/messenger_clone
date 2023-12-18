import {
  index,
  text,
  pgTable,
  serial,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

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

export const chatsTable = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    userId1: uuid("user_id1").notNull(),
    userId2: uuid("user_id2").notNull(),
    pinnedMessageId: uuid("pinned_message_id"),
    latestMessageId: uuid("latest_message_id"),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);

export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    content: text("content").notNull(),
    senderId: uuid("sender_id").notNull(),
    chatId: uuid("chat_id").notNull(),
    isVisible: boolean("is_visibled").notNull().default(true),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);