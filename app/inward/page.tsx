"use client";

import { useEffect, useState } from "react";

export default function InwardPage() {

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [vendors, setVendors] =
    useState<any[]>([]);

  const [inwardData, setInwardData] =
    useState<any[]>([]);

  const [form, setForm] =
    useState({

      inward_date:
        new Date()
          .toISOString()
          .split("T")[0],

      inward_month:
        new Date()
          .toLocaleString(
            "default",
            { month: "long" }
          ),

      material_code: "",

      description: "",

      uom: "",

      vendor_name: "",

      invoice_no: "",

      good_qty: "",

      ng_qty: "",

      remarks: ""

    });

  useEffect(() => {

    fetchMaterials();

    fetchVendors();

    fetchInwardData();

  }, []);

  async function fetchMaterials() {

    try {

      const response =
        await fetch(
          "/api/material-master"
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

  async function fetchVendors() {

    try {

      const response =
        await fetch(
          "/api/vendor-dept"
        );

      const result =
        await response.json();

      if (
        Array.isArray(result)
      ) {

        setVendors(result);

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function fetchInwardData() {

    try {

      const response =
        await fetch(
          "/api/inward"
        );

      const result =
        await response.json();

      if (
        Array.isArray(result)
      ) {

        setInwardData(result);

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
        selected?.description || "",

      uom:
        selected?.uom || ""

    });

  }

  async function handleSubmit() {

    try {

      const response =
        await fetch(
          "/api/inward",
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
          "Inward Saved Successfully"
        );

        setForm({

          inward_date:
            new Date()
              .toISOString()
              .split("T")[0],

          inward_month:
            new Date()
              .toLocaleString(
                "default",
                { month: "long" }
              ),

          material_code: "",

          description: "",

          uom: "",

          vendor_name: "",

          invoice_no: "",

          good_qty: "",

          ng_qty: "",

          remarks: ""

        });

        fetchInwardData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Inward Entry
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-6">

        <input
          type="date"
          value={form.inward_date}
          readOnly
          className="
            border
            p-2
            rounded
            bg-gray-100
          "
        />

        <input
          type="text"
          value={form.inward_month}
          readOnly
          className="
            border
            p-2
            rounded
            bg-gray-100
          "
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

                {
                  item.material_code
                }

              </option>

            )
          )}

        </select>

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          readOnly
          className="
            border
            p-2
            rounded
            bg-gray-100
          "
        />

        <input
          type="text"
          placeholder="UOM"
          value={form.uom}
          readOnly
          className="
            border
            p-2
            rounded
            bg-gray-100
          "
        />

        <select
          value={form.vendor_name}
          onChange={(e) =>
            setForm({
              ...form,
              vendor_name:
                e.target.value
            })
          }
          className="border p-2 rounded"
        >

          <option value="">
            Select Vendor
          </option>

          {vendors.map(
            (vendor: any) => (

              <option
                key={vendor.id}
                value={
                  vendor.vendor_dept
                }
              >

                {
                  vendor.vendor_dept
                }

              </option>

            )
          )}

        </select>

        <input
          type="text"
          placeholder="Invoice No"
          value={form.invoice_no}
          onChange={(e) =>
            setForm({
              ...form,
              invoice_no:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Good Qty"
          value={form.good_qty}
          onChange={(e) =>
            setForm({
              ...form,
              good_qty:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="NG Qty"
          value={form.ng_qty}
          onChange={(e) =>
            setForm({
              ...form,
              ng_qty:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="
            bg-black
            text-white
            rounded
            px-4
            py-2
          "
        >
          Submit
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Date
              </th>

              <th className="border p-2">
                Month
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                UOM
              </th>

              <th className="border p-2">
                Vendor
              </th>

              <th className="border p-2">
                Invoice No
              </th>

              <th className="border p-2">
                Good Qty
              </th>

              <th className="border p-2">
                NG Qty
              </th>

              <th className="border p-2">
                Remarks
              </th>

            </tr>

          </thead>

          <tbody>

            {inwardData.map(
              (
                item: any,
                index: number
              ) => (

                <tr key={index}>

                  <td className="border p-2">
                    {
                      item.inward_date
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.inward_month
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

                  <td className="border p-2">
                    {
                      item.uom
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.vendor_name
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.invoice_no
                    }
                  </td>

                  <td className="border p-2 text-green-600 font-bold">
                    {
                      item.good_qty
                    }
                  </td>

                  <td className="border p-2 text-red-600 font-bold">
                    {
                      item.ng_qty
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.remarks
                    }
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