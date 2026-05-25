import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: "Request body must be a non-empty array" },
      { status: 400 }
    );
  }

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    for (let i = 0; i < body.length; i++) {
      const row = body[i];

      const code = String(row.material_code || "").trim();
      const desc = String(row.description || "").trim();
      const type = String(row.type_of_material || "").trim() || null;
      const uom = String(row.uom || "").trim();

      if (!code) {
        errors.push(`Row ${i + 1}: missing material_code`);
        continue;
      }
      if (!uom) {
        errors.push(`Row ${i + 1}: missing uom`);
        continue;
      }

      try {
        await sql`
          INSERT INTO material_master (material_code, description, type_of_material, uom)
          VALUES (${code}, ${desc || null}, ${type}, ${uom})
        `;
        inserted++;
      } catch (err: any) {
        if (err.code === "23505") {
          skipped++;
        } else {
          errors.push(`Row ${i + 1} (${code}): ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      errors,
      total: body.length,
    });
  } catch (error: any) {
    console.error("POST /bulk-upload/materials failed:", error);
    return NextResponse.json(
      { error: error.message || "Bulk upload failed" },
      { status: 500 }
    );
  }
}