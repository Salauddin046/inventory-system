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

  } catch (error) {

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

    const existing =
      await sql`

        SELECT *

        FROM projection_master

        WHERE id = ${body.id}

      `;

    if (
      existing.length === 0
    ) {

      return NextResponse.json({
        success: false
      });

    }

    const row =
      existing[0];

    const projectionQty =
      Number(
        row.projection_qty || 0
      );

    if (
      body.projection_action !==
      undefined
    ) {

      let allocatedQty = 0;

      if (
        body.projection_action ===
        "Allocate"
      ) {

        allocatedQty =
          projectionQty;

      }

      if (
        body.projection_action ===
        "Un Allocate"
      ) {

        allocatedQty = 0;

      }

      await sql`

        UPDATE projection_master

        SET

          projection_action =
          ${body.projection_action},

          allocated_qty =
          ${allocatedQty}

        WHERE id =
        ${body.id}

      `;

    }

    if (
      body.stock_action !==
      undefined
    ) {

      const stockQty =
        Number(
          body.stock_qty || 0
        );

      let allocatedQty =
        projectionQty -
        stockQty;

      if (
        allocatedQty < 0
      ) {

        allocatedQty = 0;

      }

      await sql`

        UPDATE projection_master

        SET

          stock_qty =
          ${stockQty},

          stock_action =
          ${body.stock_action},

          allocated_qty =
          ${allocatedQty}

        WHERE id =
        ${body.id}

      `;

    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {

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

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      success: false
    });

  }

}