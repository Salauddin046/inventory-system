import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT *

        FROM materials

        ORDER BY id DESC

      `;

    return NextResponse.json(data);

  } catch (error) {

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

      INSERT INTO materials
      (
        material_code,
        description,
        uom,
        req_person,
        vendor_or_dept
      )

      VALUES
      (
        ${body.material_code},
        ${body.description},
        ${body.uom},
        ${body.req_person},
        ${body.vendor_or_dept}
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