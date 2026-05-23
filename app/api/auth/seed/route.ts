import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// IMPORTANT: Delete this file after creating your admin user.

export async function POST(request: Request) {
  try {
    const existing = await sql`SELECT COUNT(*) as count FROM users`;
    const count = Number(existing[0].count);

    if (count > 0) {
      return NextResponse.json(
        { error: "Users already exist. Seed disabled." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const hash = await hashPassword(password);

    const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${hash}, ${name || null})
      RETURNING id, email
    `;

    return NextResponse.json({ success: true, user: result[0] });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}