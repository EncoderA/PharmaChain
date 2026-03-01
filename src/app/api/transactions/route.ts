import { NextResponse } from "next/server";
import db from "@/db/index";
import { transactionsTable, productsTable, usersTable } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const conditions = [];

    if (productId) {
      conditions.push(eq(transactionsTable.productId, parseInt(productId)));
    }

    if (userId) {
      const uid = parseInt(userId);
      conditions.push(
        or(
          eq(transactionsTable.fromUserId, uid),
          eq(transactionsTable.toUserId, uid),
        )!,
      );
    }

    if (status && status !== "all") {
      conditions.push(
        eq(
          transactionsTable.status,
          status as "Confirmed" | "Pending" | "Failed",
        ),
      );
    }

    // Role-based filtering
    if (user.role !== "admin") {
      conditions.push(
        or(
          eq(transactionsTable.fromUserId, user.id),
          eq(transactionsTable.toUserId, user.id),
        )!,
      );
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const fromUser = alias(usersTable, "from_user");
    const toUser = alias(usersTable, "to_user");

    const transactions = await db
      .select({
        id: transactionsTable.id,
        productId: transactionsTable.productId,
        action: transactionsTable.action,
        fromUserId: transactionsTable.fromUserId,
        toUserId: transactionsTable.toUserId,
        txHash: transactionsTable.txHash,
        blockNumber: transactionsTable.blockNumber,
        status: transactionsTable.status,
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
      .where(whereClause)
      .orderBy(sql`${transactionsTable.createdAt} DESC`);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        productId: body.productId || null,
        action: body.action,
        fromUserId: body.fromUserId || null,
        toUserId: body.toUserId || null,
        txHash: body.txHash || null,
        blockNumber: body.blockNumber || null,
        status: body.status || "Pending",
      })
      .returning();

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
