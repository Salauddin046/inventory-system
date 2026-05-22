"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProjectionMasterPage() {

  const [projectionData, setProjectionData] =
    useState<any[]>([]);

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [form, setForm] =
    useState({

      projection_month: "",

      revision_no: "",

      material_code: "",

      description: "",

      projection_qty: "",

      projection_action: "",

      stock_qty: "",

      stock_action: ""

    });

  useEffect(() => {

    fetchProjectionData();

    fetchMaterials();

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

  async function fetchMaterials() {

    try {

      const response =
        await fetch(
          "/api/materials"
        );

      const result =
        await response.json();

      if (
        Array.isArray(result)
      ) {

        setMaterials(result);

      }

    } catch (error) {

      console.log(error);

    }

  }

  function handleMaterialChange(
    value: string
  ) {

    const selected =
      materials.find(
        (item: any) =>
          item.material_code === value
      );

    setForm({

      ...form,

      material_code: value,

      description:
        selected?.description || ""

    });

  }

  async function handleProjectionSubmit() {

    try {

      const response =
        await fetch(
          "/api/projection-master",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                ...form,

                type:
                  "projection"

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Updated"
        );

        fetchProjectionData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function handleStockSubmit() {

    try {

      const response =
        await fetch(
          "/api/projection-master",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                ...form,

                type:
                  "stock"

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

      <div className="grid grid-cols-4 gap-4 mb-6">

        <input
          type="text"
          placeholder="Projection Month"
          value={form.projection_month}
          onChange={(e) =>
            setForm({
              ...form,
              projection_month:
                e.target.value
            })
          }
          className="border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Revision No"
          value={form.revision_no}
          onChange={(e) =>
            setForm({
              ...form,
              revision_no:
                e.target.value
            })
          }
          className="border p-3 rounded"
        />

        <select
          value={form.material_code}
          onChange={(e) =>
            handleMaterialChange(
              e.target.value
            )
          }
          className="border p-3 rounded"
        >

          <option value="">
            Select Material
          </option>

          {materials.map(
            (item: any) => (

              <option
                key={item.id}
                value={
                  item.material_code
                }
              >

                {
                  item.material_code
                }

              </option>

            )
          )}

        </select>

        <input
          type="text"
          value={form.description}
          readOnly
          placeholder="Description"
          className="
            border
            p-3
            rounded
            bg-gray-100
          "
        />

        <input
          type="number"
          placeholder="Projection Qty"
          value={form.projection_qty}
          onChange={(e) =>
            setForm({
              ...form,
              projection_qty:
                e.target.value
            })
          }
          className="border p-3 rounded"
        />

        <select
          value={
            form.projection_action
          }
          onChange={(e) =>
            setForm({
              ...form,
              projection_action:
                e.target.value
            })
          }
          className="border p-3 rounded"
        >

          <option value="">
            Projection Action
          </option>

          <option value="Allocate">
            Allocate
          </option>

          <option value="Un Allocate">
            Un Allocate
          </option>

        </select>

        <input
          type="number"
          placeholder="Stock Qty"
          value={form.stock_qty}
          onChange={(e) =>
            setForm({
              ...form,
              stock_qty:
                e.target.value
            })
          }
          className="border p-3 rounded"
        />

        <select
          value={form.stock_action}
          onChange={(e) =>
            setForm({
              ...form,
              stock_action:
                e.target.value
            })
          }
          className="border p-3 rounded"
        >

          <option value="">
            Stock Action
          </option>

          <option value="Issue">
            Issue
          </option>

          <option value="Not Issue">
            Not Issue
          </option>

          <option value="Clear">
            Clear
          </option>

        </select>

      </div>

      <div className="flex gap-4 mb-6">

        <button
          onClick={
            handleProjectionSubmit
          }
          className="
            bg-blue-600
            text-white
            px-6
            py-3
            rounded
          "
        >
          Projection Submit
        </button>

        <button
          onClick={
            handleStockSubmit
          }
          className="
            bg-green-600
            text-white
            px-6
            py-3
            rounded
          "
        >
          Stock Submit
        </button>

      </div>

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
                Projection Action
              </th>

              <th className="border p-3 text-center">
                Stock Qty
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

                    <td className="border p-3 text-center">
                      {
                        item.projection_action
                      }
                    </td>

                    <td className="border p-3 text-center text-green-600 font-bold">
                      {
                        item.stock_qty
                      }
                    </td>

                    <td className="border p-3 text-center">
                      {
                        item.stock_action
                      }
                    </td>

                    <td className="border p-3 text-center">

                      <button
                        onClick={() =>
                          handleClear(
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
                  colSpan={9}
                  className="
                    border
                    p-4
                    text-center
                  "
                >
                  No Projection Data
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}