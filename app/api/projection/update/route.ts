import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    await sql`

      UPDATE projection_master

      SET

        projection_action =
          ${body.projection_action},

        stock_action =
          ${body.stock_action},

        stock_qty =
          ${body.stock_qty}

      WHERE id =
        ${body.id}

    `;

    if (
      body.projection_action ===
      "Allocate"
    ) {

      await sql`

        UPDATE live_stock

        SET
          projection_qty =
            ${body.projection_qty}

        WHERE material_code =
          ${body.material_code}

      `;

    }

    if (
      body.projection_action ===
      "Unallocate"
    ) {

      await sql`

        UPDATE live_stock

        SET
          projection_qty = 0

        WHERE material_code =
          ${body.material_code}

      `;

    }

    if (
      body.stock_action ===
      "Issue"
    ) {

      await sql`

        UPDATE live_stock

        SET

          projection_qty =
            projection_qty -
            ${body.stock_qty},

          total_outward =
            total_outward +
            ${body.stock_qty}

        WHERE material_code =
          ${body.material_code}

      `;

    }

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json({

      success: false,

      error: error.message

    });

  }

}