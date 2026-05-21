"use client";

import { useEffect, useState } from "react";

export default function ProjectionPage() {

  const [projectionData, setProjectionData] =
    useState<any[]>([]);

  useEffect(() => {

    fetchProjection();

  }, []);

  async function fetchProjection() {

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

      setProjectionData(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (error) {

      console.log(error);

    }

  }

  async function updateProjection(
    item: any
  ) {

    try {

      const projectionAction =
        (
          document.getElementById(
            `projection-action-${item.id}`
          ) as HTMLSelectElement
        )?.value;

      const stockAction =
        (
          document.getElementById(
            `stock-action-${item.id}`
          ) as HTMLSelectElement
        )?.value;

      const stockQty =
        Number(
          (
            document.getElementById(
              `stock-qty-${item.id}`
            ) as HTMLInputElement
          )?.value || 0
        );

      const response =
        await fetch(
          "/api/projection/update",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                id: item.id,

                material_code:
                  item.material_code,

                projection_qty:
                  item.qty,

                projection_action:
                  projectionAction,

                stock_action:
                  stockAction,

                stock_qty:
                  stockQty

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Updated Successfully"
        );

        fetchProjection();

      }

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Projection Data
      </h1>

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
                Projection Qty
              </th>

              <th className="border p-2">
                Projection Action
              </th>

              <th className="border p-2">
                Stock Action
              </th>

              <th className="border p-2">
                Stock Qty
              </th>

              <th className="border p-2">
                Update
              </th>

            </tr>

          </thead>

          <tbody>

            {projectionData.map(
              (
                item: any,
                index: number
              ) => (

                <tr key={index}>

                  <td className="border p-2">
                    {item.material_code}
                  </td>

                  <td className="border p-2">
                    {item.description}
                  </td>

                  <td className="border p-2 font-bold">
                    {item.qty}
                  </td>

                  <td className="border p-2">

                    <select
                      id={`projection-action-${item.id}`}
                      defaultValue={
                        item.projection_action ||
                        "Unallocate"
                      }
                      className="border p-2 rounded"
                    >

                      <option value="Allocate">
                        Allocate
                      </option>

                      <option value="Unallocate">
                        Unallocate
                      </option>

                    </select>

                  </td>

                  <td className="border p-2">

                    <select
                      id={`stock-action-${item.id}`}
                      defaultValue={
                        item.stock_action ||
                        "Not Issue"
                      }
                      className="border p-2 rounded"
                    >

                      <option value="Issue">
                        Issue
                      </option>

                      <option value="Not Issue">
                        Not Issue
                      </option>

                    </select>

                  </td>

                  <td className="border p-2">

                    <input
                      type="number"
                      id={`stock-qty-${item.id}`}
                      defaultValue={0}
                      className="border p-2 rounded w-24"
                    />

                  </td>

                  <td className="border p-2">

                    <button
                      type="button"
                      onClick={() =>
                        updateProjection(item)
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Update
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}