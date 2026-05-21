import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const inward = await sql`

      SELECT *

      FROM inward_transactions

      ORDER BY id DESC

    `;

    return NextResponse.json(inward);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inward data"
      },
      {
        status: 500
      }
    );

  }

}

export async function POST(request: Request) {

  try {

    const body = await request.json();

    await sql`

      INSERT INTO inward_transactions
      (
        vendor_name,
        type_of_inward,
        invoice_no,
        material_code,
        material_description,
        type_of_material,
        g_qty,
        ng_qty,
        uom,
        tally_ref_no,
        remarks,
        inward_date
      )

      VALUES
      (
        ${body.vendor_name},
        ${body.type_of_inward},
        ${body.invoice_no},
        ${body.material_code},
        ${body.material_description},
        ${body.type_of_material},
        ${body.g_qty},
        ${body.ng_qty},
        ${body.uom},
        ${body.tally_ref_no},
        ${body.remarks},
        ${body.inward_date}
      )

    `;

    return NextResponse.json({
      success: true,
      message: "Inward saved successfully"
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save inward"
      },
      {
        status: 500
      }
    );

  }

}