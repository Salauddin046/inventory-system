import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  try {
    const cleanEmail = String(email).trim().toLowerCase();

    const users = await sql`
      SELECT id, email, password_hash, name, status
      FROM users
      WHERE email = ${cleanEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check user status BEFORE creating session
    if (user.status === "pending") {
      return NextResponse.json(
        { error: "Your account is pending admin approval. Please wait." },
        { status: 403 }
      );
    }

    if (user.status === "disabled") {
      return NextResponse.json(
        { error: "Your account has been disabled. Contact the admin." },
        { status: 403 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account status invalid. Contact the admin." },
        { status: 403 }
      );
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}