import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, getAuthUser } from "@/lib/auth";

/**
 * POST /api/admin/add-user
 * Admin creates a new user in the database.
 * The on-chain role assignment (addAdmin, addManufacturer, addDistributor, addWholesaler)
 * is done from the client via MetaMask BEFORE calling this endpoint.
 *
 * Body: { fullName, organization, email, phone, role, walletId, password?, manufacturerId? }
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can add users via this endpoint" },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (
      !body.fullName ||
      !body.organization ||
      !body.email ||
      !body.phone ||
      !body.role ||
      !body.walletId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validRoles = ["admin", "manufacturer", "distributor", "pharmacist", "wholesaler"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Determine manufacturerId for roles that need it
    const needsManufacturer = ["distributor", "pharmacist", "wholesaler"].includes(body.role);
    let manufacturerId: number | null = null;

    if (needsManufacturer) {
      if (!body.manufacturerId) {
        return NextResponse.json(
          { error: "manufacturerId is required for distributor/wholesaler/pharmacist roles" },
          { status: 400 },
        );
      }
      manufacturerId = Number(body.manufacturerId);

      // Validate that the manufacturer exists and is active
      const manufacturer = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, manufacturerId),
            eq(usersTable.role, "manufacturer"),
            eq(usersTable.status, "active"),
          ),
        );

      if (manufacturer.length === 0) {
        return NextResponse.json(
          { error: "Selected manufacturer not found or inactive" },
          { status: 400 },
        );
      }
    }

    // Check duplicates
    const existingByWallet = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.walletId, body.walletId));

    if (existingByWallet.length > 0) {
      return NextResponse.json(
        { error: "A user with this wallet address already exists" },
        { status: 409 },
      );
    }

    const existingByEmail = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (existingByEmail.length > 0) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (body.password) {
      hashedPassword = await hashPassword(body.password);
    }

    const inserted = await db
      .insert(usersTable)
      .values({
        fullName: body.fullName,
        organization: body.organization,
        email: body.email,
        phone: body.phone,
        role: body.role,
        walletId: body.walletId,
        password: hashedPassword,
        manufacturerId,
        status: "active", // Admin-created users are active immediately
      })
      .returning({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        organization: usersTable.organization,
        walletId: usersTable.walletId,
        status: usersTable.status,
      });

    return NextResponse.json({ success: true, user: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding user (admin):", error);
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 },
    );
  }
}
