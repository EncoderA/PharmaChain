import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { ca } from "date-fns/locale";

export async function GET() {
  try {
    const allUsers = await db.select().from(usersTable);
    return NextResponse.json(allUsers);
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
