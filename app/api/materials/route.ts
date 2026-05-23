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
      SELECT id, material_code, description, type_of_material, uom
      FROM material_master
      ORDER BY id DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /materials failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

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

  const { material_code, description, type_of_material, uom } = body;

  if (!material_code || typeof material_code !== "string" || !material_code.trim()) {
    return NextResponse.json(
      { error: "material_code is required" },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO material_master (material_code, description, type_of_material, uom)
      VALUES (
        ${material_code.trim()},
        ${description || null},
        ${type_of_material || null},
        ${uom || null}
      )
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /materials failed:", error);

    // Postgres unique constraint violation code
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Material code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create material" },
      { status: 500 }
    );
  }
}