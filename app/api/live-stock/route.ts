import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {

  try {

    const data =
      await sql`

        SELECT

          m.material_code,

          m.description,

          COALESCE(
            i.inward_qty,
            0
          ) AS inward_qty,

          COALESCE(
            o.outward_qty,
            0
          ) AS outward_qty,

          COALESCE(
            p.pending_projection_qty,
            0
          ) AS projection_qty

        FROM material_master m

        LEFT JOIN (

          SELECT

            material_code,

            SUM(
              COALESCE(
                g_qty,
                0
              )
            ) AS inward_qty

          FROM inward_transactions

          GROUP BY material_code

        ) i

        ON
        m.material_code =
        i.material_code

        LEFT JOIN (

          SELECT

            material_code,

            SUM(
              COALESCE(
                g_outward_qty,
                0
              )
            ) AS outward_qty

          FROM outward_transactions

          GROUP BY material_code

        ) o

        ON
        m.material_code =
        o.material_code

        LEFT JOIN (

          SELECT

            material_code,

            SUM(

              CASE

                WHEN stock_action =
                'Issue'

                THEN

                  projection_qty -
                  stock_qty

                WHEN stock_action =
                'Not Issue'

                THEN

                  0

                ELSE

                  projection_qty

              END

            ) AS pending_projection_qty

          FROM projection_master

          WHERE
          projection_action =
          'Allocate'

          GROUP BY material_code

        ) p

        ON
        m.material_code =
        p.material_code

        ORDER BY
        m.material_code ASC

      `;

    return NextResponse.json(
      data
    );

  } catch (error: any) {

    console.log(error);

    return NextResponse.json([]);

  }

}