import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT *

        FROM projection_master

        ORDER BY id DESC

      `;

    return NextResponse.json(
      data
    );

  } catch (error: any) {

    console.log(error);

    return NextResponse.json([]);

  }

}

export async function PUT(
  request: Request
) {

  try {

    const body =
      await request.json();

    await sql`

      UPDATE projection_master

      SET

        projection_action =
        COALESCE(
          ${body.projection_action},
          projection_action
        ),

        stock_action =
        COALESCE(
          ${body.stock_action},
          stock_action
        ),

        stock_qty =
        COALESCE(
          ${Number(
            body.stock_qty || 0
          )},
          stock_qty
        )

      WHERE id =
      ${body.id}

    `;

    return NextResponse.json({

      success: true

    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json({

      success: false

    });

  }

}

export async function DELETE(
  request: Request
) {

  try {

    const body =
      await request.json();

    await sql`

      DELETE FROM
      projection_master

      WHERE id =
      ${body.id}

    `;

    return NextResponse.json({

      success: true

    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json({

      success: false

    });

  }

}