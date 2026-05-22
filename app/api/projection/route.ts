import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT *

        FROM projection_upload

        ORDER BY id DESC

      `;

    return NextResponse.json(
      data
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}