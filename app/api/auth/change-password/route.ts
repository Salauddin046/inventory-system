import { NextResponse } from "next/server";
import sql from "@/lib/db";
import {
  getCurrentUser,
  verifyPassword,
  hashPassword,
  clearSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { current_password, new_password } = body;

  if (!current_password || typeof current_password !== "string") {
    return NextResponse.json(
      { error: "Current password is required" },
      { status: 400 }
    );
  }

  if (!new_password || typeof new_password !== "string") {
    return NextResponse.json(
      { error: "New password is required" },
      { status: 400 }
    );
  }

  if (new_password.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (current_password === new_password) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  try {
    // Fetch current password hash from DB
    const [dbUser] = await sql`
      SELECT password_hash FROM users WHERE id = ${user.userId}
    `;

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const valid = await verifyPassword(current_password, dbUser.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password and update
    const newHash = await hashPassword(new_password);
    await sql`
      UPDATE users
      SET password_hash = ${newHash}
      WHERE id = ${user.userId}
    `;

    // Force logout — user must log in with new password
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Password changed. Please log in with your new password.",
    });
  } catch (error: any) {
    console.error("POST /auth/change-password failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}