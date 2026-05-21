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

          ${Number(
            row.qty || 0
          )},

          'Unallocate',

          'Not Issue',

          0,

          0

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