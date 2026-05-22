export async function PUT(
  request: Request
) {

  try {

    const body =
      await request.json();

    if (
      body.projection_action
    ) {

      await sql`

        UPDATE projection_master

        SET

          projection_action =
          ${body.projection_action}

        WHERE id =
        ${body.id}

      `;

    }

    if (
      body.stock_action
    ) {

      await sql`

        UPDATE projection_master

        SET

          stock_qty =
          ${body.stock_qty || 0},

          stock_action =
          ${body.stock_action}

        WHERE id =
        ${body.id}

      `;

    }

    return NextResponse.json({

      success: true

    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({

      success: false

    });

  }

}