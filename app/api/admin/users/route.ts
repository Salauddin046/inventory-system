import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const VALID_STATUSES = ["active", "pending", "disabled"];

// GET /api/admin/users - list all users (admin only)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.userId !== 1) {
    return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
  }

  try {
    const data = await sql`
      SELECT id, email, name, status, created_at
      FROM users
      ORDER BY status ASC, id ASC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /admin/users failed:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH /api/admin/users - update a user's status (admin only)
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.userId !== 1) {
    return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = body;

  if (!id || !Number.isFinite(Number(id))) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const targetId = Number(id);

  // Prevent admin from disabling themselves
  if (targetId === 1 && status !== "active") {
    return NextResponse.json(
      { error: "Cannot change status of the primary admin account" },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      UPDATE users
      SET status = ${status}
      WHERE id = ${targetId}
      RETURNING id, email, name, status
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    console.error("PATCH /admin/users failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}