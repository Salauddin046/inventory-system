"use client";

import Link from "next/link";
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

    <div className="p-4">

      <div className="flex justify-between items-center mb-4">

        <Link href="/">

          <button
            className="
              bg-gray-700
              text-white
              px-4
              py-2
              rounded
            "
          >
            Back
          </button>

        </Link>

        <input
          type="text"
          placeholder="Search Material"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            border
            p-2
            rounded
            w-80
          "
        />

      </div>

      <h1 className="text-4xl font-bold mb-6">
        Live Stock
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-3">
                Material Code
              </th>

              <th className="border p-3">
                Description
              </th>

              <th className="border p-3">
                Good Inward
              </th>

              <th className="border p-3">
                NG Inward
              </th>

              <th className="border p-3">
                Good Outward
              </th>

              <th className="border p-3">
                NG Outward
              </th>

              <th className="border p-3">
                Projection Qty
              </th>

              <th className="border p-3">
                Live Stock
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.length >
            0 ? (

              filteredData.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={index}>

                    <td className="border p-3 font-bold">

                      {
                        item.material_code
                      }

                    </td>

                    <td className="border p-3">

                      {
                        item.description
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-green-600
                        font-bold
                      "
                    >

                      {
                        item.good_inward
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-red-600
                        font-bold
                      "
                    >

                      {
                        item.ng_inward
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-blue-600
                        font-bold
                      "
                    >

                      {
                        item.good_outward
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-orange-600
                        font-bold
                      "
                    >

                      {
                        item.ng_outward
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-yellow-600
                        font-bold
                      "
                    >

                      {
                        item.projection_qty
                      }

                    </td>

                    <td
                      className="
                        border
                        p-3
                        text-purple-600
                        font-bold
                      "
                    >

                      {
                        item.live_stock
                      }

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={8}
                  className="
                    border
                    p-4
                    text-center
                  "
                >
                  No Stock Data Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}