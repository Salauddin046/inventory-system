import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT
          id,
          material_code,
          description,
          type_of_material,
          uom

        FROM material_master

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

      INSERT INTO material_master
      (
        material_code,
        description,
        type_of_material,
        uom
      )

      VALUES
      (
        ${body.material_code},
        ${body.description},
        ${body.type_of_material},
        ${body.uom}
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