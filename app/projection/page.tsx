"use client";

import { useEffect, useState } from "react";

export default function ProjectionPage() {

  const [projectionData, setProjectionData] =
    useState<any[]>([]);

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [form, setForm] = useState({

    projection_month: "",

    revision_no: "",

    material_code: "",

    description: "",

    projection_qty: "",

    projection_action: "Allocate",

    stock_qty: "",

    stock_action: "Not Issue"

  });

  useEffect(() => {

    fetchData();

  }, []);

  async function fetchData() {

    try {

      const projectionRes =
        await fetch(
          "/api/projection",
          {
            cache: "no-store"
          }
        );

      const projectionJson =
        await projectionRes.json();

      if (
        Array.isArray(
          projectionJson
        )
      ) {

        setProjectionData(
          projectionJson
        );

      }

      const materialRes =
        await fetch(
          "/api/materials"
        );

      const materialJson =
        await materialRes.json();

      if (
        Array.isArray(
          materialJson
        )
      ) {

        setMaterials(
          materialJson
        );

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function handleSubmit(
    e: any
  ) {

    e.preventDefault();

    try {

      const response =
        await fetch(
          "/api/projection",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(form)

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Saved Successfully"
        );

        fetchData();

        setForm({

          projection_month: "",

          revision_no: "",

          material_code: "",

          description: "",

          projection_qty: "",

          projection_action:
            "Allocate",

          stock_qty: "",

          stock_action:
            "Not Issue"

        });

      } else {

        alert(
          result.error ||
          "Save Failed"
        );

      }

    } catch (error) {

      console.log(error);

    }

  }

  function handleMaterialChange(
    code: string
  ) {

    const selected =
      materials.find(
        (item: any) =>
          item.material_code === code
      );

    if (selected) {

      setForm({
        ...form,

        material_code:
          selected.material_code,

        description:
          selected.description || ""

      });

    }

  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Projection Master
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-4 gap-4 mb-8"
      >

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
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        />

        <select
          value={form.material_code}
          onChange={(e) =>
            handleMaterialChange(
              e.target.value
            )
          }
          className="border p-2 rounded"
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
                {item.material_code}
              </option>

            )
          )}

        </select>

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          readOnly
          className="border p-2 rounded bg-gray-100"
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
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        >

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
          className="border p-2 rounded"
        />

        <select
          value={
            form.stock_action
          }
          onChange={(e) =>
            setForm({
              ...form,
              stock_action:
                e.target.value
            })
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

        <button
          type="submit"
          className="bg-black text-white p-2 rounded"
        >
          Submit
        </button>

      </form>

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
                Stock Qty
              </th>

              <th className="border p-2">
                Stock Action
              </th>

              <th className="border p-2">
                Outward Qty
              </th>

              <th className="border p-2">
                Returned To Live Stock
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

                    <tr key={index}>

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
                        {
                          item.projection_action
                        }
                      </td>

                      <td className="border p-2">
                        {
                          stockQty
                        }
                      </td>

                      <td className="border p-2">
                        {
                          item.stock_action
                        }
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

                    </tr>

                  );

                }
              )

            ) : (

              <tr>

                <td
                  colSpan={10}
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