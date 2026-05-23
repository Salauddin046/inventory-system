import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/job-cards/[id] - get job card with line items
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
      SELECT id, job_card_no, requester, request_date, status, remarks, created_at
      FROM job_cards
      WHERE id = ${id}
    `;

    if (!jobCard) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 });
    }

    const items = await sql`
      SELECT id, material_code, description, requested_qty, issued_qty, status
      FROM job_card_items
      WHERE job_card_id = ${id}
      ORDER BY id ASC
    `;

    return NextResponse.json({ ...jobCard, items });
  } catch (error) {
    console.error("GET /job-cards/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch job card" }, { status: 500 });
  }
}

// DELETE /api/job-cards/[id] - delete entire job card (cascades to items)
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
    const deleted = await sql`
      DELETE FROM job_cards
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /job-cards/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete job card" }, { status: 500 });
  }
}