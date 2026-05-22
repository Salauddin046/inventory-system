"use client";

import { useEffect, useState } from "react";

export default function LiveStockPage() {

  const [stockData, setStockData] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    fetchLiveStock();

  }, []);

  async function fetchLiveStock() {

    try {

      const response =
        await fetch(
          "/api/live-stock",
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      console.log(result);

      if (
        Array.isArray(result)
      ) {

        setStockData(result);

      }

    } catch (error) {

      console.log(error);

    }

  }

  const filteredData =
    stockData.filter(
      (item: any) =>

        item.material_code
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.description
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

    );

  return (

    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Live Stock
        </h1>

        <input
          type="text"
          placeholder="Search Material"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-2 rounded w-80"
        />

      </div>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                Inward Qty
              </th>

              <th className="border p-2">
                Outward Qty
              </th>

              <th className="border p-2">
                Projection Qty
              </th>

              <th className="border p-2">
                Live Stock
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData &&
            filteredData.length > 0 ? (

              filteredData.map(
                (
                  item: any,
                  index: number
                ) => {

                  const inwardQty =
                    Number(
                      item.inward_qty || 0
                    );

                  const outwardQty =
                    Number(
                      item.outward_qty || 0
                    );

                  const projectionQty =
                    Number(
                      item.projection_qty || 0
                    );

                  const liveStock =

                    inwardQty

                    -

                    outwardQty

                    -

                    projectionQty;

                  return (

                    <tr key={index}>

                      <td className="border p-2 font-bold">
                        {
                          item.material_code
                        }
                      </td>

                      <td className="border p-2">
                        {
                          item.description
                        }
                      </td>

                      <td className="border p-2 text-blue-600 font-bold">
                        {
                          inwardQty
                        }
                      </td>

                      <td className="border p-2 text-red-600 font-bold">
                        {
                          outwardQty
                        }
                      </td>

                      <td className="border p-2 text-yellow-600 font-bold">
                        {
                          projectionQty
                        }
                      </td>

                      <td className="border p-2 text-green-600 font-bold">
                        {
                          liveStock
                        }
                      </td>

                    </tr>

                  );

                }
              )

            ) : (

              <tr>

                <td
                  colSpan={6}
                  className="border p-4 text-center"
                >
                  No Live Stock Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}