import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
  "manufacturer",
  "distributor",
  "pharmacist",
  "admin",
]);

export const productStatusEnum = pgEnum("product_status", [
  "Verified",
  "Pending",
  "Expired",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "Confirmed",
  "Pending",
  "Failed",
]);

// ==================== USERS ====================

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
  phone: varchar({ length: 12 }).notNull(),
  role: userRoleEnum("role").notNull(),
  walletId: varchar({ length: 50 }).notNull(),
  password: varchar({ length: 255 }), // nullable — existing users have no password yet
});

// ==================== PRODUCTS ====================

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  productCode: varchar("product_code", { length: 50 }).unique().notNull(),
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 100 }),
  batch: varchar({ length: 100 }),
  stock: integer().default(0).notNull(),
  status: productStatusEnum("status").default("Pending").notNull(),
  manufacturerId: integer("manufacturer_id").references(() => usersTable.id),
  currentOwnerId: integer("current_owner_id").references(() => usersTable.id),
  manufacturingDate: timestamp("manufacturing_date"),
  expiryDate: timestamp("expiry_date"),
  blockchainHash: varchar("blockchain_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== TRANSACTIONS ====================

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => productsTable.id),
  action: varchar({ length: 100 }).notNull(),
  fromUserId: integer("from_user_id").references(() => usersTable.id),
  toUserId: integer("to_user_id").references(() => usersTable.id),
  txHash: varchar("tx_hash", { length: 255 }),
  blockNumber: integer("block_number"),
  status: transactionStatusEnum("status").default("Pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
