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

  // Validate each row before inserting any
  for (const row of body) {
    if (!row.material_code || typeof row.material_code !== "string") {
      return NextResponse.json(
        { error: "Each row must have a material_code" },
        { status: 400 }
      );
    }
    const qty = Number(row.qty || row.projection_qty || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: `Invalid quantity for ${row.material_code}` },
        { status: 400 }
      );
    }
  }

  try {
    await sql.begin(async (tx) => {
      for (const row of body) {
        const projectionQty = Number(row.qty || row.projection_qty || 0);

        await tx`
          INSERT INTO projection_master (
            projection_month,
            revision_no,
            material_code,
            description,
            projection_qty,
            projection_action,
            stock_action,
            stock_qty,
            allocated_qty,
            balance_qty,
            returned_live_stock
          ) VALUES (
            ${row.projection_month || null},
            ${row.revision_no || null},
            ${row.material_code},
            ${row.description || null},
            ${projectionQty},
            NULL,
            NULL,
            0,
            0,
            0,
            0
          )
        `;
      }
    });

    return NextResponse.json({
      success: true,
      message: `${body.length} projection(s) uploaded. Allocate them via Projection page.`,
    });
  } catch (error: any) {
    console.error("POST /projection-upload/manual failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload projections" },
      { status: 500 }
    );
  }
}