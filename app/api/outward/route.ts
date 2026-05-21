import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT *

        FROM outward_transactions

        ORDER BY id DESC

      `;

    console.log(data);

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

    await sql`

      INSERT INTO outward_transactions
      (

        req_date,

        month,

        req_person,

        to_vendor_dept,

        job_card_po_no,

        material_code,

        material_description,

        type_of_material,

        req_qty,

        g_outward_qty,

        ng_outward_qty,

        uom,

        issuance_date,

        tally_ref_no,

        remarks

      )

      VALUES
      (

        ${body.req_date},

        ${body.month},

        ${body.req_person},

        ${body.to_vendor_dept},

        ${body.job_card_po_no},

        ${body.material_code},

        ${body.material_description},

        ${body.type_of_material},

        ${Number(body.req_qty || 0)},

        ${Number(body.g_outward_qty || 0)},

        ${Number(body.ng_outward_qty || 0)},

        ${body.uom},

        ${body.issuance_date},

        ${body.tally_ref_no},

        ${body.remarks}

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

}