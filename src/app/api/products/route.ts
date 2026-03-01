import { NextResponse } from "next/server";
import db from "@/db/index";
import { productsTable, usersTable } from "@/db/schema";
import { eq, ilike, or, sql, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const manufacturerId = searchParams.get("manufacturerId");
    const search = searchParams.get("search");

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(
        eq(productsTable.status, status as "Verified" | "Pending" | "Expired"),
      );
    }

    if (manufacturerId) {
      conditions.push(eq(productsTable.manufacturerId, parseInt(manufacturerId)));
    }

    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.productCode, `%${search}%`),
          ilike(productsTable.batch, `%${search}%`),
          ilike(productsTable.category, `%${search}%`),
        )!,
      );
    }

    // Role-based filtering: manufacturers see their own products
    if (user.role === "manufacturer") {
      conditions.push(eq(productsTable.manufacturerId, user.id));
    } else if (user.role === "distributor" || user.role === "pharmacist") {
      // Distributors/pharmacists see products they currently own or all distributed/wholesaled
      conditions.push(
        or(
          eq(productsTable.currentOwnerId, user.id),
          eq(productsTable.manufacturerId, user.id),
        )!,
      );
    }
    // Admins see everything — no extra filter

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

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
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.manufacturerId, usersTable.id))
      .where(whereClause)
      .orderBy(sql`${productsTable.createdAt} DESC`);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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

    if (user.role !== "manufacturer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only manufacturers can create products" },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (!body.name || !body.productCode) {
      return NextResponse.json(
        { error: "Product name and product code are required" },
        { status: 400 },
      );
    }

    // Check for duplicate product code
    const existing = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.productCode, body.productCode));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Product code already exists" },
        { status: 409 },
      );
    }

    const [product] = await db
      .insert(productsTable)
      .values({
        productCode: body.productCode,
        name: body.name,
        category: body.category || null,
        batch: body.batch || null,
        stock: body.stock ?? 0,
        status: body.status || "Pending",
        manufacturerId: user.role === "admin" ? (body.manufacturerId || user.id) : user.id,
        currentOwnerId: user.role === "admin" ? (body.manufacturerId || user.id) : user.id,
        manufacturingDate: body.manufacturingDate
          ? new Date(body.manufacturingDate)
          : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        blockchainHash: body.blockchainHash || null,
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
