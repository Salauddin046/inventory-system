"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProjectionPage() {

  const [projectionData, setProjectionData] =
    useState<any[]>([]);

  useEffect(() => {

    fetchData();

  }, []);

  async function fetchData() {

    try {

      const response =
        await fetch(
          "/api/projection",
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

  function handleChange(
    index: number,
    field: string,
    value: string
  ) {

    const updated =
      [...projectionData];

    updated[index][field] =
      value;

    setProjectionData(
      updated
    );

  }

  async function submitProjection(
    item: any
  ) {

    try {

      const response =
        await fetch(
          "/api/projection",
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                id: item.id,

                projection_action:
                  item.projection_action

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Updated Successfully"
        );

        fetchData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function submitStock(
    item: any
  ) {

    try {

      const response =
        await fetch(
          "/api/projection",
          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                id: item.id,

                stock_qty:
                  Number(
                    item.stock_qty || 0
                  ),

                stock_action:
                  item.stock_action

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Stock Updated Successfully"
        );

        fetchData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function clearProjection(
    id: number
  ) {

    try {

      const response =
        await fetch(
          "/api/projection",
          {

            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                id
              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Cleared Successfully"
        );

        fetchData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <div className="p-6">

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

      <h1 className="text-3xl font-bold mb-6">
        Projection Master
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2 text-center">
                Projection Month
              </th>

              <th className="border p-2 text-center">
                Revision No
              </th>

              <th className="border p-2 text-center">
                Material Code
              </th>

              <th className="border p-2 text-center">
                Description
              </th>

              <th className="border p-2 text-center">
                Projection Qty
              </th>

              <th className="border p-2 text-center">
                Projection Action
              </th>

              <th className="border p-2 text-center">
                Projection Submit
              </th>

              <th className="border p-2 text-center">
                Stock Qty
              </th>

              <th className="border p-2 text-center">
                Stock Action
              </th>

              <th className="border p-2 text-center">
                Stock Submit
              </th>

              <th className="border p-2 text-center">
                Outward Qty
              </th>

              <th className="border p-2 text-center">
                Returned Live Stock
              </th>

              <th className="border p-2 text-center">
                Clear Projection
              </th>

            </tr>

          </thead>

          <tbody>

            {projectionData &&
            projectionData.length > 0 ? (

              projectionData.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={item.id}>

                    <td className="border p-2 text-center">
                      {
                        item.projection_month
                      }
                    </td>

                    <td className="border p-2 text-center">
                      {
                        item.revision_no
                      }
                    </td>

                    <td className="border p-2 text-center font-bold">
                      {
                        item.material_code
                      }
                    </td>

                    <td className="border p-2 text-center">
                      {
                        item.description
                      }
                    </td>

                    <td className="border p-2 text-center text-blue-600 font-bold">
                      {
                        item.projection_qty
                      }
                    </td>

                    <td className="border p-2">

                      <select
                        value={
                          item.projection_action || ""
                        }

                        disabled={
                          item.stock_action ===
                          "Issue"
                        }

                        onChange={(e) =>
                          handleChange(
                            index,
                            "projection_action",
                            e.target.value
                          )
                        }

                        className="border p-1 rounded w-full"
                      >

                        <option value="">
                          Select
                        </option>

                        <option value="Allocate">
                          Allocate
                        </option>

                        <option value="Un Allocate">
                          Un Allocate
                        </option>

                      </select>

                    </td>

                    <td className="border p-2 text-center">

                      <button
                        onClick={() =>
                          submitProjection(
                            item
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
                        Submit
                      </button>

                    </td>

                    <td className="border p-2">

                      <input
                        type="number"

                        value={
                          item.stock_qty || ""
                        }

                        onChange={(e) =>
                          handleChange(
                            index,
                            "stock_qty",
                            e.target.value
                          )
                        }

                        className="border p-1 rounded w-full"
                      />

                    </td>

                    <td className="border p-2">

                      <select
                        value={
                          item.stock_action || ""
                        }

                        onChange={(e) =>
                          handleChange(
                            index,
                            "stock_action",
                            e.target.value
                          )
                        }

                        className="border p-1 rounded w-full"
                      >

                        <option value="">
                          Select
                        </option>

                        <option value="Issue">
                          Issue
                        </option>

                        <option value="Not Issue">
                          Not Issue
                        </option>

                      </select>

                    </td>

                    <td className="border p-2 text-center">

                      <button
                        onClick={() =>
                          submitStock(item)
                        }

                        className="
                          bg-black
                          text-white
                          px-3
                          py-1
                          rounded
                        "
                      >
                        Submit
                      </button>

                    </td>

                    <td className="border p-2 text-center text-red-600 font-bold">

                      {
                        item.stock_action ===
                        "Issue"

                          ? item.stock_qty || 0

                          : 0
                      }

                    </td>

                    <td className="border p-2 text-center text-green-600 font-bold">

                      {
                        item.returned_live_stock || 0
                      }

                    </td>

                    <td className="border p-2 text-center">

                      <button
                        onClick={() =>
                          clearProjection(
                            item.id
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
                        Clear
                      </button>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={13}
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

    </div>

  );

}