import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalMaterials = await sql`
      SELECT COUNT(*) AS total FROM material_master
    `;

    const totalInward = await sql`
      SELECT COALESCE(SUM(g_qty), 0) AS total FROM inward_transactions
    `;

    const totalOutward = await sql`
      SELECT COALESCE(SUM(g_outward_qty), 0) AS total FROM outward_transactions
    `;

    const totalProjection = await sql`
      SELECT COALESCE(SUM(projection_qty), 0) AS total
      FROM projection_master
      WHERE projection_action = 'Allocate'
        AND (stock_action IS NULL OR stock_action = '')
    `;

    const openJobCards = await sql`
      SELECT COUNT(*) AS total
      FROM job_cards
      WHERE status IN ('Open', 'Partial')
    `;

    const inward = Number(totalInward?.[0]?.total || 0);
    const outward = Number(totalOutward?.[0]?.total || 0);
    const projection = Number(totalProjection?.[0]?.total || 0);
    const liveStock = inward - outward - projection;

    return NextResponse.json({
      totalMaterials: Number(totalMaterials?.[0]?.total || 0),
      totalInward: inward,
      totalOutward: outward,
      totalProjection: projection,
      openJobCards: Number(openJobCards?.[0]?.total || 0),
      liveStock,
    });
  } catch (error) {
    console.error("GET /dashboard failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}