import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data = await sql`

      SELECT

        m.material_code,

        m.description,

        COALESCE(i.good_inward, 0)
        AS good_inward,

        COALESCE(i.ng_inward, 0)
        AS ng_inward,

        COALESCE(o.good_outward, 0)
        AS good_outward,

        COALESCE(o.ng_outward, 0)
        AS ng_outward,

        COALESCE(p.projection_qty, 0)
        AS projection_qty,

        (

          COALESCE(i.good_inward, 0)

          -

          COALESCE(o.good_outward, 0)

          -

          COALESCE(p.projection_qty, 0)

        ) AS live_stock

      FROM material_master m

      LEFT JOIN (

        SELECT

          material_code,

          SUM(g_qty) AS good_inward,

          SUM(ng_qty) AS ng_inward

        FROM inward_transactions

        GROUP BY material_code

      ) i

      ON m.material_code =
      i.material_code

      LEFT JOIN (

        SELECT

          material_code,

          SUM(g_outward_qty)
          AS good_outward,

          SUM(ng_outward_qty)
          AS ng_outward

        FROM outward_transactions

        GROUP BY material_code

      ) o

      ON m.material_code =
      o.material_code

      LEFT JOIN (

        SELECT

          material_code,

          SUM(projection_qty)
          AS projection_qty

        FROM projection_master

        GROUP BY material_code

      ) p

      ON m.material_code =
      p.material_code

      ORDER BY
      m.material_code ASC

    `;

    return NextResponse.json(
      data
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}