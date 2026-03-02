import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = users[0];

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { error: "Account has no password set. Contact an admin." },
        { status: 401 },
      );
    }

    // Block pending / rejected users
    if (user.status === "pending") {
      return NextResponse.json(
        { error: "Your account is awaiting approval from the manufacturer." },
        { status: 403 },
      );
    }
    if (user.status === "rejected") {
      return NextResponse.json(
        { error: "Your registration was rejected. Please contact the manufacturer." },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create JWT and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email ?? "",
      role: user.role,
    });

    await setAuthCookie(token);

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        organization: user.organization,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletId: user.walletId,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
