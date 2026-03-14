import { NextResponse } from "next/server";
import db from "@/db";
import {
  productsTable,
  transactionsTable,
  usersTable,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET(
  req: Request,
  context: { params: Promise<{ hash: string }> }
) {
  const { hash } = await context.params;

  console.log("HASH RECEIVED:", hash);

  try {

    // 1️⃣ Find product
    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.blockchainHash, hash));

    if (!product.length) {
      return NextResponse.json({
        success: false,
        message: "Product not found",
      });
    }

    const productData = product[0];

    // alias users table
    const fromUser = alias(usersTable, "fromUser");
    const toUser = alias(usersTable, "toUser");

    // 2️⃣ Fetch journey
    const journey = await db
      .select({
        action: transactionsTable.action,
        status: transactionsTable.status,
        blockNumber: transactionsTable.blockNumber,
        txHash: transactionsTable.txHash,
        createdAt: transactionsTable.createdAt,

        fromUser: fromUser.fullName,
        toUser: toUser.fullName,
      })
      .from(transactionsTable)
      .leftJoin(fromUser, eq(transactionsTable.fromUserId, fromUser.id))
      .leftJoin(toUser, eq(transactionsTable.toUserId, toUser.id))
      .where(eq(transactionsTable.productId, productData.id))
      .orderBy(asc(transactionsTable.createdAt));

    return NextResponse.json({
      success: true,
      product: productData,
      journey,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });

  }
}