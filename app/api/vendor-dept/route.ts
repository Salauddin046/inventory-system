import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    await sql`

      INSERT INTO vendor_dept_master
      (
        vendor_dept
      )

      VALUES
      (
        ${body.vendor_dept}
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