import { NextResponse } from "next/server";
import db from "@/db/index";
import { productsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Alias for current owner join
    const products = await db
      .select({
        id: productsTable.id,
        productCode: productsTable.productCode,
        name: productsTable.name,
        category: productsTable.category,
        batch: productsTable.batch,
        stock: productsTable.stock,
        status: productsTable.status,
        manufacturerId: productsTable.manufacturerId,
        currentOwnerId: productsTable.currentOwnerId,
        manufacturingDate: productsTable.manufacturingDate,
        expiryDate: productsTable.expiryDate,
        blockchainHash: productsTable.blockchainHash,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
        manufacturerName: usersTable.fullName,
        manufacturerOrg: usersTable.organization,
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.manufacturerId, usersTable.id))
      .where(eq(productsTable.id, productId));

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(products[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check product exists
    const existing = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.batch !== undefined) updateData.batch = body.batch;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.currentOwnerId !== undefined) updateData.currentOwnerId = body.currentOwnerId;
    if (body.blockchainHash !== undefined) updateData.blockchainHash = body.blockchainHash;
    if (body.expiryDate !== undefined) updateData.expiryDate = new Date(body.expiryDate);
    if (body.manufacturingDate !== undefined) updateData.manufacturingDate = new Date(body.manufacturingDate);

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, productId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
