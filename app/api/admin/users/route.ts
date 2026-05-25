import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const VALID_STATUSES = ["active", "pending", "disabled"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
  }

  try {
    const data = await sql`
      SELECT id, email, name, status, is_admin, created_at
      FROM users
      ORDER BY status ASC, id ASC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /admin/users failed:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.isAdmin) {
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

  // Don't allow disabling self
  if (targetId === user.userId && status !== "active") {
    return NextResponse.json(
      { error: "You cannot change your own account status" },
      { status: 400 }
    );
  }

  // Don't allow changing another admin's status (defensive — only admin can hit this)
  try {
    const [targetUser] = await sql`
      SELECT is_admin FROM users WHERE id = ${targetId}
    `;

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.is_admin && status !== "active") {
      return NextResponse.json(
        { error: "Cannot disable another admin account" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE users
      SET status = ${status}
      WHERE id = ${targetId}
      RETURNING id, email, name, status
    `;

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    console.error("PATCH /admin/users failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}