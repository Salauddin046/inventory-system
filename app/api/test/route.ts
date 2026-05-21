import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  const result = await sql`
    SELECT NOW()
  `;

  return NextResponse.json(result);

}