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

    console.log(body);

    await sql`

      INSERT INTO outward_transactions
      (

        outward_date,

        month,

        req_person,

        vendor_dept,

        type_of_outward,

        material_code,

        material_description,

        type_of_material,

        g_outward_qty,

        ng_outward_qty,

        uom,

        remarks

      )

      VALUES
      (

        ${body.outward_date},

        ${body.month},

        ${body.req_person},

        ${body.vendor_dept},

        ${body.type_of_outward},

        ${body.material_code},

        ${body.material_description},

        ${body.type_of_material},

        ${Number(body.g_outward_qty || 0)},

        ${Number(body.ng_outward_qty || 0)},

        ${body.uom},

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