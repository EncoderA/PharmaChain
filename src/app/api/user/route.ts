import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { ca } from "date-fns/locale";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const walletId = searchParams.get("walletId");

    if (email) {
      const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
      if (users.length > 0) {
        return NextResponse.json({ exists: true, reason: "email" });
      }
    }

    if (walletId) {
      const users = await db.select().from(usersTable).where(eq(usersTable.walletId, walletId));
      if (users.length > 0) {
        return NextResponse.json({ exists: true, reason: "wallet" });
      }
    }

    if (!email && !walletId) {
      const allUsers = await db.select().from(usersTable);
      return NextResponse.json(allUsers);
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
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

    // Check duplicates by walletId or email
    try {
      const existingByWallet = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.walletId, body.walletId));

      if (existingByWallet && existingByWallet.length > 0) {
        return NextResponse.json({ error: "User with this wallet already exists" }, { status: 409 });
      }

      const existingByEmail = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, body.email));

      if (existingByEmail && existingByEmail.length > 0) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
      }
    } catch (dbErr) {
      console.error("Error checking existing user:", dbErr);
      // continue to insertion attempt which will surface errors
    }

    await db.insert(usersTable).values({
      fullName: body.fullName,
      organization: body.organization,
      email: body.email,
      phone: body.phone,
      role: body.role,
      walletId: body.walletId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
