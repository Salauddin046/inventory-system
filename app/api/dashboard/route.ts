import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const totalMaterials =
      await sql`

        SELECT COUNT(*) AS total

        FROM material_master

      `;

    const totalInward =
      await sql`

        SELECT

          COALESCE(
            SUM(g_qty),
            0
          ) AS total

        FROM inward_transactions

      `;

    const totalOutward =
      await sql`

        SELECT

          COALESCE(
            SUM(g_outward_qty),
            0
          ) AS total

        FROM outward_transactions

      `;

    const totalProjection =
      await sql`

        SELECT

          COALESCE(
            SUM(projection_qty),
            0
          ) AS total

        FROM projection_master

        WHERE projection_action =
        'Allocate'

      `;

    const liveStock =
      Number(
        totalInward[0].total || 0
      )

      -

      Number(
        totalOutward[0].total || 0
      )

      -

      Number(
        totalProjection[0].total || 0
      );

    return NextResponse.json({

      totalMaterials:
        Number(
          totalMaterials[0].total || 0
        ),

      totalInward:
        Number(
          totalInward[0].total || 0
        ),

      totalOutward:
        Number(
          totalOutward[0].total || 0
        ),

      totalProjection:
        Number(
          totalProjection[0].total || 0
        ),

      liveStock

    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json({

      totalMaterials: 0,

      totalInward: 0,

      totalOutward: 0,

      totalProjection: 0,

      liveStock: 0

    });

  }

}