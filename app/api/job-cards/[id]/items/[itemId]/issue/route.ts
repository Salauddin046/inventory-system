import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST /api/job-cards/[id]/items/[itemId]/issue
// Marks an item as issued. The actual outward entry is created
// separately on the Outward page. This endpoint just updates status.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr, itemId: itemIdStr } = await params;
  const id = Number(idStr);
  const itemId = Number(itemIdStr);

  if (!Number.isFinite(id) || !Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const issuedQty = Number(body.issued_qty);
  if (!Number.isFinite(issuedQty) || issuedQty <= 0) {
    return NextResponse.json(
      { error: "issued_qty must be a positive number" },
      { status: 400 }
    );
  }

  try {
    const result = await sql.begin(async (tx) => {
      const [item] = await tx`
        SELECT id, job_card_id, requested_qty, issued_qty, status
        FROM job_card_items
        WHERE id = ${itemId} AND job_card_id = ${id}
        FOR UPDATE
      `;

      if (!item) {
        return { notFound: true };
      }

      const requestedQty = Number(item.requested_qty);
      const currentIssued = Number(item.issued_qty || 0);
      const newIssued = currentIssued + issuedQty;

      if (newIssued > requestedQty) {
        throw new Error(
          `Total issued (${newIssued}) cannot exceed requested (${requestedQty})`
        );
      }

      const newStatus = newIssued >= requestedQty ? "Issued" : "Partial";

      await tx`
        UPDATE job_card_items
        SET issued_qty = ${newIssued},
            status = ${newStatus}
        WHERE id = ${itemId}
      `;

      // Update parent job card status based on all items
      const items = await tx`
        SELECT status FROM job_card_items WHERE job_card_id = ${id}
      `;

      const allIssued = items.every((i: any) => i.status === "Issued");
      const anyIssued = items.some(
        (i: any) => i.status === "Issued" || i.status === "Partial"
      );

      const jobCardStatus = allIssued ? "Closed" : anyIssued ? "Partial" : "Open";

      await tx`
        UPDATE job_cards
        SET status = ${jobCardStatus}
        WHERE id = ${id}
      `;

      return { notFound: false };
    });

    if (result.notFound) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /issue failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to issue item" },
      { status: 500 }
    );
  }
}