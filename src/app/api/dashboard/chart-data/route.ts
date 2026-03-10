import { NextResponse } from "next/server";
import db from "@/db/index";
import { transactionsTable } from "@/db/schema";
import { eq, sql, or, and, gte } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateFilter = gte(transactionsTable.createdAt, thirtyDaysAgo);

    // Role-scoped filter
    const roleFilter =
      user.role === "admin"
        ? undefined
        : or(
            eq(transactionsTable.fromUserId, user.id),
            eq(transactionsTable.toUserId, user.id),
          );

    const whereClause = roleFilter
      ? and(dateFilter, roleFilter)
      : dateFilter;

    const rows = await db
      .select({
        date: sql<string>`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM-DD')`,
        transactions: sql<number>`COUNT(*)::int`,
      })
      .from(transactionsTable)
      .where(whereClause)
      .groupBy(sql`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM-DD')`);

    // Fill in missing dates with 0
    const result: { date: string; transactions: number }[] = [];
    const dataMap = new Map(rows.map((r) => [r.date, r.transactions]));

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, transactions: dataMap.get(key) ?? 0 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 },
    );
  }
}
