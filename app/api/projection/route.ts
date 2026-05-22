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

    if (
      body.projection_action !==
      undefined
    ) {

      await sql`

        UPDATE projection_master

        SET

          projection_action =
          ${body.projection_action}

        WHERE id =
        ${body.id}

      `;

    }

    if (
      body.stock_action !==
      undefined
    ) {

      await sql`

        UPDATE projection_master

        SET

          stock_qty =
          ${Number(
            body.stock_qty || 0
          )},

          stock_action =
          ${body.stock_action}

        WHERE id =
        ${body.id}

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