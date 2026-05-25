import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, name } = body;

  // Validation
  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  try {
    // Check if email already exists (including pending/disabled)
    const existing = await sql`
      SELECT id, status FROM users WHERE email = ${cleanEmail}
    `;

    if (existing.length > 0) {
      const user = existing[0];
      if (user.status === "active") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      } else if (user.status === "pending") {
        return NextResponse.json(
          { error: "An account with this email is awaiting approval" },
          { status: 400 }
        );
      } else if (user.status === "disabled") {
        return NextResponse.json(
          { error: "This email cannot be registered. Contact admin." },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with pending status
    await sql`
      INSERT INTO users (email, password_hash, name, status)
      VALUES (${cleanEmail}, ${passwordHash}, ${cleanName}, 'pending')
    `;

    return NextResponse.json({
      success: true,
      message: "Account created. Awaiting admin approval.",
    });
  } catch (error: any) {
    console.error("POST /auth/register failed:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}