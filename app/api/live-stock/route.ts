LEFT JOIN (

  SELECT

    material_code,

    SUM(

      CASE

        WHEN projection_action =
        'Allocate'

        AND (
          stock_action IS NULL
          OR stock_action = ''
        )

        THEN
        projection_qty

        ELSE
        0

      END

    ) AS projection_qty

  FROM projection_master

  GROUP BY material_code

) p

ON
m.material_code =
p.material_code