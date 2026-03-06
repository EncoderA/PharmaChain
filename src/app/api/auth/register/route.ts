import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (
      !body.fullName ||
      !body.email ||
      !body.password ||
      !body.role ||
      !body.organization ||
      !body.phone ||
      !body.walletId
    ) {
      return NextResponse.json(
        { error: "All fields are required (including wallet address)" },
        { status: 400 },
      );
    }

    // Validate role — admin registration is not allowed via public signup
    const validRoles = ["manufacturer", "distributor", "pharmacist", "wholesaler"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingByEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (existingByEmail.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Check if wallet already exists
    const existingByWallet = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.walletId, body.walletId));

    if (existingByWallet.length > 0) {
      return NextResponse.json(
        { error: "An account with this wallet address already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Determine status: manufacturers are active immediately, others need approval
    const status = body.role === "manufacturer" ? "active" : "pending";

    // Create user
    const inserted = await db
      .insert(usersTable)
      .values({
        fullName: body.fullName,
        email: body.email,
        password: hashedPassword,
        role: body.role,
        organization: body.organization,
        phone: body.phone,
        walletId: body.walletId,
        status,
      })
      .returning({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        organization: usersTable.organization,
        phone: usersTable.phone,
        walletId: usersTable.walletId,
        status: usersTable.status,
      });

    const user = inserted[0];

    // Only auto-login active users (manufacturers)
    if (user.status === "active") {
      const token = await createToken({
        userId: user.id,
        email: user.email ?? "",
        role: user.role,
      });

      await setAuthCookie(token);

      return NextResponse.json({ user }, { status: 201 });
    }

    // Pending users get a success message but no session
    return NextResponse.json(
      {
        user,
        pending: true,
        message:
          "Registration submitted successfully. Your account is pending approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

