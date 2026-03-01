import { NextResponse } from "next/server";
import db from "@/db/index";
import { productsTable, transactionsTable, usersTable } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Total products count
    const [productCount] = await db
      .select({ count: count() })
      .from(productsTable);

    // Products by status
    const statusCounts = await db
      .select({
        status: productsTable.status,
        count: count(),
      })
      .from(productsTable)
      .groupBy(productsTable.status);

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = row.count;
    }

    // Low stock count (stock < 50)
    const [lowStockCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(sql`${productsTable.stock} < 50`);

    // Total transactions count
    const [txCount] = await db
      .select({ count: count() })
      .from(transactionsTable);

    // Transactions by status
    const txStatusCounts = await db
      .select({
        status: transactionsTable.status,
        count: count(),
      })
      .from(transactionsTable)
      .groupBy(transactionsTable.status);

    const txStatusMap: Record<string, number> = {};
    for (const row of txStatusCounts) {
      txStatusMap[row.status] = row.count;
    }

    // Total users count
    const [userCount] = await db
      .select({ count: count() })
      .from(usersTable);

    // Users by role
    const roleCounts = await db
      .select({
        role: usersTable.role,
        count: count(),
      })
      .from(usersTable)
      .groupBy(usersTable.role);

    const roleMap: Record<string, number> = {};
    for (const row of roleCounts) {
      roleMap[row.role] = row.count;
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
        manufacturers: roleMap["manufacturer"] ?? 0,
        distributors: roleMap["distributor"] ?? 0,
        pharmacists: roleMap["pharmacist"] ?? 0,
        admins: roleMap["admin"] ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
