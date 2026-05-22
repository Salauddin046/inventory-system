"use client";

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

  async function updateProjection(
    data: any
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
              JSON.stringify(data)

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Updated Successfully"
        );

        fetchData();

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

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Projection Master
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Projection Month
              </th>

              <th className="border p-2">
                Revision No
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                Projection Qty
              </th>

              <th className="border p-2">
                Projection Action
              </th>

              <th className="border p-2">
                Projection Submit
              </th>

              <th className="border p-2">
                Stock Qty
              </th>

              <th className="border p-2">
                Stock Action
              </th>

              <th className="border p-2">
                Stock Submit
              </th>

              <th className="border p-2">
                Outward Qty
              </th>

              <th className="border p-2">
                Returned Live Stock
              </th>

              <th className="border p-2">
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
                ) => {

                  const projectionQty =
                    Number(
                      item.projection_qty || 0
                    );

                  const stockQty =
                    Number(
                      item.stock_qty || 0
                    );

                  let outwardQty = 0;

                  let returnedQty = 0;

                  if (
                    item.stock_action ===
                    "Issue"
                  ) {

                    outwardQty =
                      stockQty;

                    returnedQty =
                      projectionQty -
                      stockQty;

                  }

                  if (
                    item.stock_action ===
                    "Not Issue"
                  ) {

                    outwardQty = 0;

                    returnedQty =
                      projectionQty;

                  }

                  return (

                    <tr key={item.id}>

                      <td className="border p-2">
                        {
                          item.projection_month
                        }
                      </td>

                      <td className="border p-2">
                        {
                          item.revision_no
                        }
                      </td>

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
                          projectionQty
                        }
                      </td>

                      <td className="border p-2">

                        <select
                          value={
                            item.projection_action || ""
                          }

                          disabled={
                            item.stock_action ===
                            "Issue" ||

                            item.stock_action ===
                            "Not Issue"
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

                      <td className="border p-2">

                        <button
                          onClick={() =>
                            updateProjection({

                              id: item.id,

                              projection_action:
                                item.projection_action

                            })
                          }

                          className="bg-blue-600 text-white px-3 py-1 rounded"
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

                      <td className="border p-2">

                        <button
                          onClick={() =>
                            updateProjection({

                              id: item.id,

                              stock_qty:
                                item.stock_qty,

                              stock_action:
                                item.stock_action

                            })
                          }

                          className="bg-black text-white px-3 py-1 rounded"
                        >
                          Submit
                        </button>

                      </td>

                      <td className="border p-2 text-red-600 font-bold">
                        {
                          outwardQty
                        }
                      </td>

                      <td className="border p-2 text-green-600 font-bold">
                        {
                          returnedQty
                        }
                      </td>

                      <td className="border p-2">

                        <button

                          onClick={async () => {

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
                                        id: item.id
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

                          }}

                          className="bg-red-600 text-white px-3 py-1 rounded"

                        >

                          Clear

                        </button>

                      </td>

                    </tr>

                  );

                }
              )

            ) : (

              <tr>

                <td
                  colSpan={13}
                  className="border p-4 text-center"
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