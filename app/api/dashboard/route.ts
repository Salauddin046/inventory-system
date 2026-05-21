import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const materials =
      await sql`
        SELECT COUNT(*) AS count
        FROM materials
      `;

    const inward =
      await sql`
        SELECT
        COALESCE(
          SUM(g_qty),
          0
        ) AS total
        FROM inward_transactions
      `;

    const outward =
      await sql`
        SELECT
        COALESCE(
          SUM(g_outward_qty),
          0
        ) AS total
        FROM outward_transactions
      `;

    const projection =
      await sql`
        SELECT
        COALESCE(
          SUM(projection_qty),
          0
        ) AS total
        FROM live_stock
      `;

    const liveStock =
      await sql`
        SELECT
        COALESCE(
          SUM(
            total_inward -
            total_outward -
            projection_qty
          ),
          0
        ) AS total
        FROM live_stock
      `;

    return NextResponse.json({

      totalMaterials:
        Number(
          materials[0].count || 0
        ),

      totalInward:
        Number(
          inward[0].total || 0
        ),

      totalOutward:
        Number(
          outward[0].total || 0
        ),

      totalProjection:
        Number(
          projection[0].total || 0
        ),

      totalLiveStock:
        Number(
          liveStock[0].total || 0
        )

    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({

      totalMaterials: 0,

      totalInward: 0,

      totalOutward: 0,

      totalProjection: 0,

      totalLiveStock: 0

    });

  }

}