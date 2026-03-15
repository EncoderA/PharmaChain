import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable, supplyChainRelationsTable } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

/**
 * Allowed supply chain precedence:
 *   manufacturer  → distributor, wholesaler
 *   distributor   → pharmacist
 *   admin         → any valid combination above
 */
const ALLOWED_RELATIONS: Record<string, string[]> = {
  manufacturer: ["distributor", "wholesaler"],
  distributor: ["pharmacist"],
  wholesaler: ["pharmacist"],
};

/**
 * POST /api/supply-relations
 * Create a supply chain relation between the current user (supplyFrom) and a target user (supplyTo).
 * Body: { supplyToId: number }
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const supplyToId = Number(body.supplyToId);

    if (!supplyToId || isNaN(supplyToId)) {
      return NextResponse.json(
        { error: "supplyToId is required and must be a valid number" },
        { status: 400 },
      );
    }

    // Cannot create a relation with yourself
    if (supplyToId === authUser.id) {
      return NextResponse.json(
        { error: "Cannot create a supply relation with yourself" },
        { status: 400 },
      );
    }

    // Fetch the target user
    const targets = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        fullName: usersTable.fullName,
        status: usersTable.status,
      })
      .from(usersTable)
      .where(eq(usersTable.id, supplyToId));

    if (targets.length === 0) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const target = targets[0];

    if (target.status !== "active") {
      return NextResponse.json(
        { error: "Target user is not active" },
        { status: 400 },
      );
    }

    // Enforce precedence rules
    if (authUser.role === "admin") {
      // Admin can create any valid relation — check that target role is a valid downstream role
      const allValidDownstream = ["distributor", "wholesaler", "pharmacist"];
      if (!allValidDownstream.includes(target.role)) {
        return NextResponse.json(
          { error: `Cannot create a supply relation to a ${target.role}` },
          { status: 403 },
        );
      }
    } else {
      const allowedTargetRoles = ALLOWED_RELATIONS[authUser.role];
      if (!allowedTargetRoles) {
        return NextResponse.json(
          { error: `Your role (${authUser.role}) cannot create supply relations` },
          { status: 403 },
        );
      }

      if (!allowedTargetRoles.includes(target.role)) {
        return NextResponse.json(
          {
            error: `A ${authUser.role} can only add ${allowedTargetRoles.join(" or ")} — not a ${target.role}`,
          },
          { status: 403 },
        );
      }
    }

    // Check if relation already exists
    const existing = await db
      .select({ id: supplyChainRelationsTable.id })
      .from(supplyChainRelationsTable)
      .where(
        and(
          eq(supplyChainRelationsTable.supplyFrom, authUser.id),
          eq(supplyChainRelationsTable.supplyTo, supplyToId),
        ),
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This supply relation already exists" },
        { status: 409 },
      );
    }

    // Create the relation
    const inserted = await db
      .insert(supplyChainRelationsTable)
      .values({
        supplyFrom: authUser.id,
        supplyTo: supplyToId,
      })
      .returning();

    return NextResponse.json(
      { success: true, relation: inserted[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating supply relation:", error);
    return NextResponse.json(
      { error: "Failed to create supply relation" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/supply-relations
 * List all supply chain relations for the current user (both as supplyFrom and supplyTo).
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For admin: return all relations
    // For others: return relations where user is supplyFrom or supplyTo
    let relations;

    if (authUser.role === "admin") {
      relations = await db
        .select()
        .from(supplyChainRelationsTable);
    } else {
      relations = await db
        .select()
        .from(supplyChainRelationsTable)
        .where(
          or(
            eq(supplyChainRelationsTable.supplyFrom, authUser.id),
            eq(supplyChainRelationsTable.supplyTo, authUser.id),
          ),
        );
    }

    return NextResponse.json(relations);
  } catch (error) {
    console.error("Error fetching supply relations:", error);
    return NextResponse.json(
      { error: "Failed to fetch supply relations" },
      { status: 500 },
    );
  }
}
