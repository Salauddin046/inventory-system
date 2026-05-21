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

    return NextResponse.json(data);

  } catch (error: any) {

    console.log(error);

    return NextResponse.json([]);

  }

}

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    let allocatedQty = 0;

    if (
      body.projection_action ===
      "Allocate"
    ) {

      allocatedQty =
        Number(
          body.projection_qty || 0
        );

    }

    if (
      body.stock_action ===
      "Issue"
    ) {

      allocatedQty =
        allocatedQty -
        Number(
          body.stock_qty || 0
        );

    }

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

        ${body.projection_month},

        ${body.revision_no},

        ${body.material_code},

        ${body.description},

        ${Number(
          body.projection_qty || 0
        )},

        ${body.projection_action},

        ${body.stock_action},

        ${Number(
          body.stock_qty || 0
        )},

        ${allocatedQty}

      )

    `;

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

}{ NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`
        SELECT *
        FROM projection_master
        ORDER BY id DESC
      `;

    return NextResponse.json(data);

  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}