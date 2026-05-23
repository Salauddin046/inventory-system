import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      SELECT id, name
      FROM departments
      WHERE active = TRUE
      ORDER BY name ASC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /departments failed:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}