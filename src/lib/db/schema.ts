import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const notesTable = pgTable("notes", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 255 }).notNull(),
});

export type Note = typeof notesTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", {
    length: 20,
    enum: ["user", "admin"],
  })
    .notNull()
    .default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
