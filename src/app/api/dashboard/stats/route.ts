import { NextResponse } from "next/server";
import db from "@/db/index";
import {
  productsTable,
  transactionsTable,
  usersTable,
  supplyChainRelationsTable,
} from "@/db/schema";
import { eq, sql, count, or, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Build role-specific product filter
    const productFilter =
      user.role === "admin"
        ? undefined
        : user.role === "manufacturer"
          ? eq(productsTable.manufacturerId, user.id)
          : // distributor, pharmacist, or wholesaler — products they currently own
            eq(productsTable.currentOwnerId, user.id);

    // Build role-specific transaction filter
    const txFilter =
      user.role === "admin"
        ? undefined
        : or(
            eq(transactionsTable.fromUserId, user.id),
            eq(transactionsTable.toUserId, user.id),
          );

    // Total products count (role-scoped)
    const productCountQuery = db.select({ count: count() }).from(productsTable);
    if (productFilter) productCountQuery.where(productFilter);
    const [productCount] = await productCountQuery;

    // Products by status (role-scoped)
    const statusCountsQuery = db
      .select({
        status: productsTable.status,
        count: count(),
      })
      .from(productsTable);
    if (productFilter) statusCountsQuery.where(productFilter);
    const statusCounts = await statusCountsQuery.groupBy(productsTable.status);

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = row.count;
    }

    // Low stock count (role-scoped)
    const lowStockQuery = db.select({ count: count() }).from(productsTable);
    if (productFilter) {
      lowStockQuery.where(and(productFilter, sql`${productsTable.stock} < 50`));
    } else {
      lowStockQuery.where(sql`${productsTable.stock} < 50`);
    }
    const [lowStockCount] = await lowStockQuery;

    // Total transactions count (role-scoped)
    const txCountQuery = db.select({ count: count() }).from(transactionsTable);
    if (txFilter) txCountQuery.where(txFilter);
    const [txCount] = await txCountQuery;

    // Transactions by status (role-scoped)
    const txStatusCountsQuery = db
      .select({
        status: transactionsTable.status,
        count: count(),
      })
      .from(transactionsTable);
    if (txFilter) txStatusCountsQuery.where(txFilter);
    const txStatusCounts = await txStatusCountsQuery.groupBy(transactionsTable.status);

    const txStatusMap: Record<string, number> = {};
    for (const row of txStatusCounts) {
      txStatusMap[row.status] = row.count;
    }

    // Total active users count — always global for admin, scoped for others
    const [userCount] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.status, "active"));

    // Active users by role — always global
    const roleCounts = await db
      .select({
        role: usersTable.role,
        count: count(),
      })
      .from(usersTable)
      .where(eq(usersTable.status, "active"))
      .groupBy(usersTable.role);

    const roleMap: Record<string, number> = {};
    for (const row of roleCounts) {
      roleMap[row.role] = row.count;
    }

    // Pending users count (for admin dashboard)
    const [pendingUserCount] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.status, "pending"));

    // ==================== RECENT PRODUCTS (5) ====================
    const recentProductsQuery = db
      .select({
        id: productsTable.id,
        productCode: productsTable.productCode,
        name: productsTable.name,
        category: productsTable.category,
        batch: productsTable.batch,
        stock: productsTable.stock,
        status: productsTable.status,
        manufacturerName: usersTable.fullName,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.manufacturerId, usersTable.id))
      .orderBy(sql`${productsTable.createdAt} DESC`)
      .limit(5);
    if (productFilter) recentProductsQuery.where(productFilter);
    const recentProducts = await recentProductsQuery;

    // ==================== RECENT TRANSACTIONS (5) ====================
    const fromUser = alias(usersTable, "from_user");
    const toUser = alias(usersTable, "to_user");

    const recentTxQuery = db
      .select({
        id: transactionsTable.id,
        action: transactionsTable.action,
        status: transactionsTable.status,
        txHash: transactionsTable.txHash,
        createdAt: transactionsTable.createdAt,
        productName: productsTable.name,
        productCode: productsTable.productCode,
        fromUserName: fromUser.fullName,
        toUserName: toUser.fullName,
      })
      .from(transactionsTable)
      .leftJoin(productsTable, eq(transactionsTable.productId, productsTable.id))
      .leftJoin(fromUser, eq(transactionsTable.fromUserId, fromUser.id))
      .leftJoin(toUser, eq(transactionsTable.toUserId, toUser.id))
      .orderBy(sql`${transactionsTable.createdAt} DESC`)
      .limit(5);
    if (txFilter) recentTxQuery.where(txFilter);
    const recentTransactions = await recentTxQuery;

    // ==================== SUPPLY CHAIN SUMMARY ====================
    let supplyChainSummary: { totalRelations: number; downstreamCount: number; upstreamCount: number } = {
      totalRelations: 0,
      downstreamCount: 0,
      upstreamCount: 0,
    };

    if (user.role === "admin") {
      const [relCount] = await db.select({ count: count() }).from(supplyChainRelationsTable);
      supplyChainSummary.totalRelations = relCount.count;
    } else {
      const [downstreamCount] = await db
        .select({ count: count() })
        .from(supplyChainRelationsTable)
        .where(eq(supplyChainRelationsTable.supplyFrom, user.id));
      const [upstreamCount] = await db
        .select({ count: count() })
        .from(supplyChainRelationsTable)
        .where(eq(supplyChainRelationsTable.supplyTo, user.id));
      supplyChainSummary.downstreamCount = downstreamCount.count;
      supplyChainSummary.upstreamCount = upstreamCount.count;
    }

    return NextResponse.json({
      products: {
        total: productCount.count,
        verified: statusMap["Verified"] ?? 0,
        pending: statusMap["Pending"] ?? 0,
        expired: statusMap["Expired"] ?? 0,
        lowStock: lowStockCount.count,
      },
      transactions: {
        total: txCount.count,
        confirmed: txStatusMap["Confirmed"] ?? 0,
        pending: txStatusMap["Pending"] ?? 0,
        failed: txStatusMap["Failed"] ?? 0,
      },
      users: {
        total: userCount.count,
        pending: pendingUserCount.count,
        manufacturers: roleMap["manufacturer"] ?? 0,
        distributors: roleMap["distributor"] ?? 0,
        pharmacists: roleMap["pharmacist"] ?? 0,
        wholesalers: roleMap["wholesaler"] ?? 0,
        admins: roleMap["admin"] ?? 0,
      },
      recentProducts,
      recentTransactions,
      supplyChainSummary,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
