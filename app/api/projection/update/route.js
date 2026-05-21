import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    await sql(
      `
      UPDATE projection_master
      SET
        projection_action = $1,
        stock_action = $2,
        stock_qty = $3
      WHERE id = $4
      `,
      [
        body.projection_action,
        body.stock_action,
        body.stock_qty,
        body.id
      ]
    );

    if (
      body.projection_action ===
      "Allocate"
    ) {

      await sql(
        `
        UPDATE live_stock
        SET
          projection_qty = $1
        WHERE material_code = $2
        `,
        [
          body.projection_qty,
          body.material_code
        ]
      );

    }

    if (
      body.projection_action ===
      "Unallocate"
    ) {

      await sql(
        `
        UPDATE live_stock
        SET
          projection_qty = 0
        WHERE material_code = $1
        `,
        [
          body.material_code
        ]
      );

    }

    if (
      body.stock_action ===
      "Issue"
    ) {

      await sql(
        `
        UPDATE live_stock
        SET
          projection_qty =
            projection_qty - $1,

          total_outward =
            total_outward + $1

        WHERE material_code = $2
        `,
        [
          body.stock_qty,
          body.material_code
        ]
      );

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