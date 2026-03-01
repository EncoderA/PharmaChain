import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "manufacturer",
  "distributor",
  "pharmacist",
  "admin",
]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
  phone: varchar({ length: 12 }).notNull(),
  role: userRoleEnum("role").notNull(),
  walletId: varchar({ length: 50 }).notNull(),
});
