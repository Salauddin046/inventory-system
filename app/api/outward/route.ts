import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const VALID_OUTWARD_TYPES = ["Projection", "Adhoc", "Conversion", "Demo", "POC"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      SELECT *
      FROM outward_transactions
      ORDER BY id DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /outward failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch outward transactions" },
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

  // Required: material_code
  if (!body.material_code || typeof body.material_code !== "string") {
    return NextResponse.json(
      { error: "material_code is required" },
      { status: 400 }
    );
  }

  // Validate outward_type if provided
  if (body.outward_type && !VALID_OUTWARD_TYPES.includes(body.outward_type)) {
    return NextResponse.json(
      { error: `outward_type must be one of: ${VALID_OUTWARD_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate numeric fields
  const reqQty = Number(body.req_qty || 0);
  const gOutwardQty = Number(body.g_outward_qty || 0);
  const ngOutwardQty = Number(body.ng_outward_qty || 0);

  if (!Number.isFinite(reqQty) || reqQty < 0) {
    return NextResponse.json({ error: "Invalid req_qty" }, { status: 400 });
  }
  if (!Number.isFinite(gOutwardQty) || gOutwardQty < 0) {
    return NextResponse.json({ error: "Invalid g_outward_qty" }, { status: 400 });
  }
  if (!Number.isFinite(ngOutwardQty) || ngOutwardQty < 0) {
    return NextResponse.json({ error: "Invalid ng_outward_qty" }, { status: 400 });
  }

  // Validate job card link if provided
  const jobCardId = body.job_card_id ? Number(body.job_card_id) : null;
  const jobCardItemId = body.job_card_item_id ? Number(body.job_card_item_id) : null;

  if (jobCardId !== null && !Number.isFinite(jobCardId)) {
    return NextResponse.json({ error: "Invalid job_card_id" }, { status: 400 });
  }
  if (jobCardItemId !== null && !Number.isFinite(jobCardItemId)) {
    return NextResponse.json({ error: "Invalid job_card_item_id" }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO outward_transactions (
        req_date,
        month,
        req_person,
        to_vendor_dept,
        job_card_po_no,
        material_code,
        material_description,
        type_of_material,
        req_qty,
        g_outward_qty,
        ng_outward_qty,
        uom,
        issuance_date,
        tally_ref_no,
        remarks,
        outward_type,
        job_card_id,
        job_card_item_id
      ) VALUES (
        ${body.req_date || null},
        ${body.month || null},
        ${body.req_person || null},
        ${body.to_vendor_dept || null},
        ${body.job_card_po_no || null},
        ${body.material_code},
        ${body.material_description || null},
        ${body.type_of_material || null},
        ${reqQty},
        ${gOutwardQty},
        ${ngOutwardQty},
        ${body.uom || null},
        ${body.issuance_date || null},
        ${body.tally_ref_no || null},
        ${body.remarks || null},
        ${body.outward_type || null},
        ${jobCardId},
        ${jobCardItemId}
      )
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /outward failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save outward" },
      { status: 500 }
    );
  }
}