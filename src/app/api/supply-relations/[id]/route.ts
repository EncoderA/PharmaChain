import { NextResponse } from "next/server";
import db from "@/db/index";
import { supplyChainRelationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

/**
 * DELETE /api/supply-relations/[id]
 * Remove a supply chain relation.
 * Only the supplyFrom user or an admin can delete.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const relationId = parseInt(id);

    if (isNaN(relationId)) {
      return NextResponse.json({ error: "Invalid relation ID" }, { status: 400 });
    }

    // Fetch the relation
    const relations = await db
      .select()
      .from(supplyChainRelationsTable)
      .where(eq(supplyChainRelationsTable.id, relationId));

    if (relations.length === 0) {
      return NextResponse.json({ error: "Relation not found" }, { status: 404 });
    }

    const relation = relations[0];

    // Only the supplyFrom user or an admin can delete
    if (authUser.role !== "admin" && relation.supplyFrom !== authUser.id) {
      return NextResponse.json(
        { error: "Only the upstream supplier or an admin can remove this relation" },
        { status: 403 },
      );
    }

    await db
      .delete(supplyChainRelationsTable)
      .where(eq(supplyChainRelationsTable.id, relationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supply relation:", error);
    return NextResponse.json(
      { error: "Failed to delete supply relation" },
      { status: 500 },
    );
  }
}
