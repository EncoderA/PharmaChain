import { NextResponse } from "next/server";
import db from "@/db/index";
import {
  consumerSalesTable,
  transactionsTable,
  productsTable,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "pharmacist" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only pharmacists can view sales" },
        { status: 403 },
      );
    }

    const conditions =
      user.role === "pharmacist"
        ? eq(consumerSalesTable.pharmacistId, user.id)
        : undefined;

    const sales = await db
      .select({
        id: consumerSalesTable.id,
        transactionId: consumerSalesTable.transactionId,
        productId: consumerSalesTable.productId,
        pharmacistId: consumerSalesTable.pharmacistId,
        consumerName: consumerSalesTable.consumerName,
        consumerPhone: consumerSalesTable.consumerPhone,
        consumerAddress: consumerSalesTable.consumerAddress,
        quantity: consumerSalesTable.quantity,
        soldAt: consumerSalesTable.soldAt,
        productName: productsTable.name,
        productCode: productsTable.productCode,
      })
      .from(consumerSalesTable)
      .leftJoin(productsTable, eq(consumerSalesTable.productId, productsTable.id))
      .where(conditions)
      .orderBy(sql`${consumerSalesTable.soldAt} DESC`);

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
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

    if (user.role !== "pharmacist") {
      return NextResponse.json(
        { error: "Only pharmacists can sell to consumers" },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (!body.productId || !body.consumerName) {
      return NextResponse.json(
        { error: "Product ID and consumer name are required" },
        { status: 400 },
      );
    }

    const quantity = body.quantity || 1;

    // Verify product exists and pharmacist owns it
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, body.productId));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.currentOwnerId !== user.id) {
      return NextResponse.json(
        { error: "You do not own this product" },
        { status: 403 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    // Step 1: Record the transaction
    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        productId: body.productId,
        action: "Sold",
        fromUserId: user.id,
        toUserId: null, // consumer has no account
        txHash: body.txHash || null,
        blockNumber: body.blockNumber || null,
        status: body.status || "Confirmed",
      })
      .returning();

    // Step 2: Create consumer sale record
    const [sale] = await db
      .insert(consumerSalesTable)
      .values({
        transactionId: transaction.id,
        productId: body.productId,
        pharmacistId: user.id,
        consumerName: body.consumerName,
        consumerPhone: body.consumerPhone || null,
        consumerAddress: body.consumerAddress || null,
        quantity,
      })
      .returning();

    // Step 3: Update product stock and owner
    const newStock = product.stock - quantity;
    await db
      .update(productsTable)
      .set({
        stock: newStock,
        currentOwnerId: newStock <= 0 ? null : product.currentOwnerId,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, body.productId));

    return NextResponse.json({ transaction, sale }, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 },
    );
  }
}
