import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data = await sql`
      SELECT *
      FROM inward_transactions
      ORDER BY id DESC
    `;

    console.log(data);

    return NextResponse.json(data);

  } catch (error: any) {

    console.error(error);

    return NextResponse.json([]);

  }

}

export async function POST(request: Request) {

  try {

    const body = await request.json();

    await sql`

      INSERT INTO inward_transactions
      (
        inward_date,
        month,
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
        remarks
      )

      VALUES
      (
        ${body.inward_date},
        ${body.month},
        ${body.vendor_name},
        ${body.type_of_inward},
        ${body.invoice_no},
        ${body.material_code},
        ${body.material_description},
        ${body.type_of_material},
        ${Number(body.g_qty)},
        ${Number(body.ng_qty || 0)},
        ${body.uom},
        ${body.tally_ref_no},
        ${body.remarks}
      )

    `;

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json({
      success: false,
      error: error.message
    });

  }

}