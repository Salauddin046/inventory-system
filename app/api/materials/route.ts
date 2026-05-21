import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  const materials = await sql`
    SELECT *
    FROM materials_master
    ORDER BY material_code
  `;

  return NextResponse.json(materials);
}

export async function POST(request: Request) {

  const body = await request.json();

  const {
    vendor_name,
    material_code,
    description,
    type_of_material
  } = body;

  await sql`

    INSERT INTO materials_master
    (
      vendor_name,
      material_code,
      description,
      type_of_material
    )

    VALUES
    (
      ${vendor_name},
      ${material_code},
      ${description},
      ${type_of_material}
    )

  `;

  return NextResponse.json({
    success: true
  });

}