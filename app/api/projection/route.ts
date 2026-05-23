import { NextResponse } from "next/server";
import sql from "@/lib/db";

const VALID_PROJECTION_ACTIONS = ["Allocate", "Un Allocate"];
const VALID_STOCK_ACTIONS = ["Issue", "Not Issue"];

export async function GET() {
  try {
    const data = await sql`
      SELECT *
      FROM projection_master
      ORDER BY id DESC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /projection failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch projections" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body?.id || typeof body.id !== "number") {
    return NextResponse.json(
      { error: "Invalid or missing id" },
      { status: 400 }
    );
  }

  const hasProjectionAction = body.projection_action !== undefined;
  const hasStockAction = body.stock_action !== undefined;

  if (!hasProjectionAction && !hasStockAction) {
    return NextResponse.json(
      { error: "Must provide either projection_action or stock_action" },
      { status: 400 }
    );
  }

  if (hasProjectionAction && hasStockAction) {
    return NextResponse.json(
      { error: "Cannot send both projection_action and stock_action" },
      { status: 400 }
    );
  }

  if (hasProjectionAction && !VALID_PROJECTION_ACTIONS.includes(body.projection_action)) {
    return NextResponse.json(
      { error: `projection_action must be one of: ${VALID_PROJECTION_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  if (hasStockAction && !VALID_STOCK_ACTIONS.includes(body.stock_action)) {
    return NextResponse.json(
      { error: `stock_action must be one of: ${VALID_STOCK_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  let stockQty = 0;
  if (hasStockAction) {
    stockQty = Number(body.stock_qty);
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      return NextResponse.json(
        { error: "stock_qty must be a non-negative number" },
        { status: 400 }
      );
    }
    if (body.stock_action === "Issue" && stockQty <= 0) {
      return NextResponse.json(
        { error: "stock_qty must be greater than 0 for Issue" },
        { status: 400 }
      );
    }
  }

  try {
    const result = await sql.begin(async (tx) => {
      const existing = await tx`
        SELECT *
        FROM projection_master
        WHERE id = ${body.id}
        FOR UPDATE
      `;

      if (existing.length === 0) {
        return { notFound: true };
      }

      const row = existing[0];
      const projectionQty = Number(row.projection_qty || 0);

      if (hasProjectionAction) {
        const allocatedQty =
          body.projection_action === "Allocate" ? projectionQty : 0;

        await tx`
          UPDATE projection_master
          SET projection_action = ${body.projection_action},
              allocated_qty = ${allocatedQty},
              stock_qty = 0,
              stock_action = NULL,
              returned_live_stock = 0,
              balance_qty = 0
          WHERE id = ${body.id}
        `;
      } else {
        // stock_action branch
        if (stockQty > projectionQty) {
          throw new Error(
            `Issue quantity (${stockQty}) cannot exceed projection quantity (${projectionQty})`
          );
        }

        let finalStockQty = 0;
        let returnedQty = 0;

        if (body.stock_action === "Issue") {
          finalStockQty = stockQty;
          returnedQty = projectionQty - stockQty;
        } else {
          // Not Issue: nothing issued, full projection returns
          finalStockQty = 0;
          returnedQty = projectionQty;
        }

        await tx`
          UPDATE projection_master
          SET stock_qty = ${finalStockQty},
              stock_action = ${body.stock_action},
              allocated_qty = 0,
              returned_live_stock = ${returnedQty},
              balance_qty = ${returnedQty}
          WHERE id = ${body.id}
        `;
      }

      return { notFound: false };
    });

    if (result.notFound) {
      return NextResponse.json(
        { error: "Projection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /projection failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update projection" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body?.id || typeof body.id !== "number") {
    return NextResponse.json(
      { error: "Invalid or missing id" },
      { status: 400 }
    );
  }

  try {
    const deleted = await sql`
      DELETE FROM projection_master
      WHERE id = ${body.id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Projection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /projection failed:", error);
    return NextResponse.json(
      { error: "Failed to delete projection" },
      { status: 500 }
    );
  }
}