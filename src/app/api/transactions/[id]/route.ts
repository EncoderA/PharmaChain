import { NextResponse } from "next/server";
import db from "@/db/index";
import { transactionsTable, productsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const txId = parseInt(id);

    if (isNaN(txId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 },
      );
    }

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
        productBatch: productsTable.batch,
        fromUserName: fromUser.fullName,
        fromUserOrg: fromUser.organization,
        toUserName: toUser.fullName,
        toUserOrg: toUser.organization,
      })
      .from(transactionsTable)
      .leftJoin(productsTable, eq(transactionsTable.productId, productsTable.id))
      .leftJoin(fromUser, eq(transactionsTable.fromUserId, fromUser.id))
      .leftJoin(toUser, eq(transactionsTable.toUserId, toUser.id))
      .where(eq(transactionsTable.id, txId));

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(transactions[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
