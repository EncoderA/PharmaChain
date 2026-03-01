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
      !body.phone
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate role
    const validRoles = ["manufacturer", "distributor", "pharmacist", "admin"];
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

    // Check if wallet already exists (if provided)
    if (body.walletId) {
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
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

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
        walletId: body.walletId || "",
      })
      .returning({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        organization: usersTable.organization,
        phone: usersTable.phone,
        walletId: usersTable.walletId,
      });

    const user = inserted[0];

    // Auto-login: create JWT and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email ?? "",
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
