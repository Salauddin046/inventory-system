import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data = await sql(
      "SELECT * FROM outward_transactions ORDER BY id DESC"
    );

    return NextResponse.json(data);

  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}

export async function POST(request: Request) {

  try {

    const body = await request.json();

    await sql(
      `
      INSERT INTO outward_transactions
      (
        req_date,
        month,
        req_person,
        type_of_outward,
        projection_month,
        to_vendor_dept,
        job_card_po_no,
        projects,
        material_code,
        description,
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
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,$17
      )
      `,
      [
        body.req_date,
        body.month,
        body.req_person,
        body.type_of_outward,
        body.projection_month,
        body.to_vendor_dept,
        body.job_card_po_no,
        body.projects,
        body.material_code,
        body.description,
        body.req_qty,
        body.g_outward_qty,
        body.ng_outward_qty,
        body.uom,
        body.issuance_date,
        body.tally_ref_no,
        body.remarks
      ]
    );

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