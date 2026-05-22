"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProjectionMasterPage() {

  const [projectionData, setProjectionData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    fetchProjectionData();

  }, []);

  async function fetchProjectionData() {

    try {

      const response =
        await fetch(
          "/api/projection-master",
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      if (
        Array.isArray(result)
      ) {

        setProjectionData(
          result
        );

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function handleProjectionAction(
    id: number,
    action: string
  ) {

    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/projection-master",
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                id,

                type:
                  "projection",

                action

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Action Updated"
        );

        fetchProjectionData();

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  }

  async function handleStockAction(
    id: number,
    action: string
  ) {

    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/projection-master",
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                id,

                type:
                  "stock",

                action

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Stock Action Updated"
        );

        fetchProjectionData();

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  }

  async function handleClear(
    id: number
  ) {

    try {

      const response =
        await fetch(
          `/api/projection-master?id=${id}`,
          {

            method: "DELETE"

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Cleared"
        );

        fetchProjectionData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <div className="p-4">

      <div className="flex items-center gap-4 mb-4">

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

      </div>

      <h1 className="text-4xl font-bold mb-6">
        Projection Master
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-3 text-center">
                Projection Month
              </th>

              <th className="border p-3 text-center">
                Revision No
              </th>

              <th className="border p-3 text-center">
                Material Code
              </th>

              <th className="border p-3 text-center">
                Description
              </th>

              <th className="border p-3 text-center">
                Projection Qty
              </th>

              <th className="border p-3 text-center">
                Allocation Qty
              </th>

              <th className="border p-3 text-center">
                Balance Qty
              </th>

              <th className="border p-3 text-center">
                Projection Action
              </th>

              <th className="border p-3 text-center">
                Stock Action
              </th>

              <th className="border p-3 text-center">
                Clear
              </th>

            </tr>

          </thead>

          <tbody>

            {projectionData.length >
            0 ? (

              projectionData.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={index}>

                    <td className="border p-3 text-center">
                      {
                        item.projection_month
                      }
                    </td>

                    <td className="border p-3 text-center">
                      {
                        item.revision_no
                      }
                    </td>

                    <td className="border p-3 text-center font-bold">
                      {
                        item.material_code
                      }
                    </td>

                    <td className="border p-3 text-center">
                      {
                        item.description
                      }
                    </td>

                    <td className="border p-3 text-center text-blue-600 font-bold">
                      {
                        item.projection_qty
                      }
                    </td>

                    <td className="border p-3 text-center text-green-600 font-bold">
                      {
                        item.allocation_qty || 0
                      }
                    </td>

                    <td className="border p-3 text-center text-purple-600 font-bold">
                      {
                        item.balance_qty || 0
                      }
                    </td>

                    <td className="border p-3 text-center">

                      <div className="flex justify-center gap-2">

                        <button
                          disabled={
                            item.stock_action ===
                            "Issue"
                          }
                          onClick={() =>
                            handleProjectionAction(
                              item.id,
                              "Allocate"
                            )
                          }
                          className="
                            bg-blue-600
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Allocate
                        </button>

                        <button
                          disabled={
                            item.stock_action ===
                            "Issue"
                          }
                          onClick={() =>
                            handleProjectionAction(
                              item.id,
                              "Un Allocate"
                            )
                          }
                          className="
                            bg-yellow-600
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Un Allocate
                        </button>

                      </div>

                    </td>

                    <td className="border p-3 text-center">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            handleStockAction(
                              item.id,
                              "Issue"
                            )
                          }
                          className="
                            bg-green-600
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Issue
                        </button>

                        <button
                          onClick={() =>
                            handleStockAction(
                              item.id,
                              "Not Issue"
                            )
                          }
                          className="
                            bg-red-600
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Not Issue
                        </button>

                      </div>

                    </td>

                    <td className="border p-3 text-center">

                      <button
                        onClick={() =>
                          handleClear(
                            item.id
                          )
                        }
                        className="
                          bg-black
                          text-white
                          px-3
                          py-1
                          rounded
                        "
                      >
                        Clear
                      </button>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={10}
                  className="
                    border
                    p-4
                    text-center
                  "
                >
                  No Projection Data Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {loading && (

        <div className="mt-4 text-center font-bold">
          Updating...
        </div>

      )}

    </div>

  );

}