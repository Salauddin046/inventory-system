import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    for (
      const row of body
    ) {

      const projectionQty =
        Number(
          row.qty ||
          row.projection_qty ||
          0
        );

      await sql`

        INSERT INTO projection_master
        (

          projection_month,

          revision_no,

          material_code,

          description,

          projection_qty,

          projection_action,

          stock_action,

          stock_qty,

          allocated_qty

        )

        VALUES
        (

          ${row.projection_month},

          ${row.revision_no},

          ${row.material_code},

          ${row.description},

          ${projectionQty},

          'Allocate',

          'Not Issue',

          0,

          ${projectionQty}

        )

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