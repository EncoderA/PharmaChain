import { NextResponse } from "next/server";
import db from "@/db/index";
import { usersTable, productsTable, transactionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

/**
 * PATCH /api/user/[id]
 * Update a user's status (approve / reject).
 * - Manufacturers can approve/reject users who registered under them.
 * - Admins can approve/reject anyone.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const newStatus = body.status;

    if (!newStatus || !["active", "rejected"].includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'rejected'." },
        { status: 400 },
      );
    }

    // Fetch the target user
    const targets = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        role: usersTable.role,
        status: usersTable.status,
        manufacturerId: usersTable.manufacturerId,
        walletId: usersTable.walletId,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (targets.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const target = targets[0];

    // Only pending users can be approved/rejected
    if (target.status !== "pending") {
      return NextResponse.json(
        { error: `User is already ${target.status}` },
        { status: 400 },
      );
    }

    // Authorization: admins can approve anyone; manufacturers can approve their own registrants
    if (authUser.role === "admin") {
      // Admin can approve/reject anyone — allowed
    } else if (authUser.role === "manufacturer") {
      if (target.manufacturerId !== authUser.id) {
        return NextResponse.json(
          { error: "You can only approve users who registered under you" },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Only manufacturers and admins can approve users" },
        { status: 403 },
      );
    }

    // Update status
    await db
      .update(usersTable)
      .set({ status: newStatus })
      .where(eq(usersTable.id, userId));

    return NextResponse.json({
      success: true,
      user: {
        id: target.id,
        fullName: target.fullName,
        role: target.role,
        walletId: target.walletId,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only admins and manufacturers can delete users
    if (authUser.role !== "admin" && authUser.role !== "manufacturer") {
      return NextResponse.json(
        { error: "Only admins and manufacturers can delete users" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check user exists
    const existing = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        manufacturerId: usersTable.manufacturerId,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (userId === authUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    // Manufacturers can only delete distributors/wholesalers/pharmacists registered under them
    if (authUser.role === "manufacturer") {
      const target = existing[0];
      const allowedRoles = ["distributor", "wholesaler", "pharmacist"];
      if (!allowedRoles.includes(target.role)) {
        return NextResponse.json(
          { error: "Manufacturers can only delete distributors and wholesalers registered under them" },
          { status: 403 },
        );
      }
      if (target.manufacturerId !== authUser.id) {
        return NextResponse.json(
          { error: "You can only delete users registered under your account" },
          { status: 403 },
        );
      }
    }

    // Nullify foreign key references so deletion is not blocked.
    // Product and transaction history is preserved — only the user link is cleared.

    // Products: nullify manufacturerId and currentOwnerId
    await db
      .update(productsTable)
      .set({ manufacturerId: null })
      .where(eq(productsTable.manufacturerId, userId));

    await db
      .update(productsTable)
      .set({ currentOwnerId: null })
      .where(eq(productsTable.currentOwnerId, userId));

    // Transactions: nullify fromUserId and toUserId
    await db
      .update(transactionsTable)
      .set({ fromUserId: null })
      .where(eq(transactionsTable.fromUserId, userId));

    await db
      .update(transactionsTable)
      .set({ toUserId: null })
      .where(eq(transactionsTable.toUserId, userId));

    // Users: nullify manufacturerId for any users registered under this user
    await db
      .update(usersTable)
      .set({ manufacturerId: null })
      .where(eq(usersTable.manufacturerId, userId));

    // Now safe to delete
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
