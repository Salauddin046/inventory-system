import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateJobCardNumber } from "@/lib/job-card-number";

// GET /api/job-cards - list all job cards with item counts
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      SELECT
        jc.id,
        jc.job_card_no,
        jc.requester,
        jc.request_date,
        jc.status,
        jc.remarks,
        jc.created_at,
        COUNT(jci.id) AS total_items,
        COUNT(CASE WHEN jci.status = 'Issued' THEN 1 END) AS issued_items
      FROM job_cards jc
      LEFT JOIN job_card_items jci ON jci.job_card_id = jc.id
      GROUP BY jc.id
      ORDER BY jc.id DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /job-cards failed:", error);
    return NextResponse.json({ error: "Failed to fetch job cards" }, { status: 500 });
  }
}

// POST /api/job-cards - create new job card with line items
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

  const { requester, request_date, remarks, items } = body;

  // Validation
  if (!requester || typeof requester !== "string" || !requester.trim()) {
    return NextResponse.json({ error: "Requester is required" }, { status: 400 });
  }

  if (!request_date) {
    return NextResponse.json({ error: "Request date is required" }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "At least one material is required" }, { status: 400 });
  }

  // Validate each item
  for (const item of items) {
    if (!item.material_code || typeof item.material_code !== "string") {
      return NextResponse.json({ error: "All items must have a material_code" }, { status: 400 });
    }
    const qty = Number(item.requested_qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: `Invalid quantity for ${item.material_code}` },
        { status: 400 }
      );
    }
  }

  try {
    const result = await sql.begin(async (tx) => {
      const jobCardNo = await generateJobCardNumber(tx);

      const [jobCard] = await tx`
        INSERT INTO job_cards (job_card_no, requester, request_date, remarks, created_by)
        VALUES (${jobCardNo}, ${requester.trim()}, ${request_date}, ${remarks || null}, ${user.userId})
        RETURNING id, job_card_no
      `;

      for (const item of items) {
        await tx`
          INSERT INTO job_card_items (job_card_id, material_code, description, requested_qty)
          VALUES (
            ${jobCard.id},
            ${item.material_code},
            ${item.description || null},
            ${Number(item.requested_qty)}
          )
        `;
      }

      return jobCard;
    });

    return NextResponse.json({ success: true, job_card: result });
  } catch (error: any) {
    console.error("POST /job-cards failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job card" },
      { status: 500 }
    );
  }
}