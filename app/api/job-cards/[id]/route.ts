import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const [jobCard] = await sql`
      SELECT id, job_card_no, requester, request_date,
             request_type, from_store, to_department, reason,
             status, remarks, created_at
      FROM job_cards
      WHERE id = ${id}
    `;

    if (!jobCard) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 });
    }

    const items = await sql`
      SELECT
        jci.id,
        jci.material_code,
        jci.description,
        jci.requested_qty,
        jci.issued_qty,
        jci.status,
        m.uom
      FROM job_card_items jci
      LEFT JOIN material_master m ON m.material_code = jci.material_code
      WHERE jci.job_card_id = ${id}
      ORDER BY jci.id ASC
    `;

    return NextResponse.json({ ...jobCard, items });
  } catch (error) {
    console.error("GET /job-cards/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch job card" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // Check status before deleting
    const [existing] = await sql`
      SELECT status FROM job_cards WHERE id = ${id}
    `;

    if (!existing) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 });
    }

    if (existing.status === "Closed") {
      return NextResponse.json(
        { error: "Cannot delete a closed job card. Closed cards are audit records." },
        { status: 400 }
      );
    }

    await sql`DELETE FROM job_cards WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /job-cards/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete job card" }, { status: 500 });
  }
}