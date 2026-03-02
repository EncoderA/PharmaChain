import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * GET /api/manufacturers
 * Public endpoint — returns active manufacturers for the registration dropdown.
 */
export async function GET() {
  try {
    const manufacturers = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        organization: usersTable.organization,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "manufacturer"),
          eq(usersTable.status, "active"),
        ),
      );

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
      { status: 500 },
    );
  }
}
