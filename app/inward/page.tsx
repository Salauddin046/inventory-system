"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function InwardPage() {

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [vendors, setVendors] =
    useState<any[]>([]);

  const [inwardData, setInwardData] =
    useState<any[]>([]);

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [form, setForm] =
    useState({

      inward_date:
        new Date()
          .toISOString()
          .split("T")[0],

      month:
        new Date()
          .toLocaleString(
            "default",
            {
              month: "long",
              year: "numeric"
            }
          ),

      vendor_name: "",

      type_of_inward: "",

      invoice_no: "",

      material_code: "",

      description: "",

      type_of_material: "",

      g_qty: "",

      ng_qty: "",

      uom: "",

      tally_ref_no: "",

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
          "/api/materials"
        );

      const result =
        await response.json();

      console.log(
        "Materials:",
        result
      );

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

          (
            item.material ||

            item.material_code ||

            item.code
          ) === value
      );

    setForm({

      ...form,

      material_code: value,

      description:
        selected?.description ||
        "",

      type_of_material:
        selected?.type_of_material ||
        "",

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

        fetchInwardData();

      }

    } catch (error) {

      console.log(error);

    }

  }

  function downloadCSV() {

    const filtered =
      inwardData.filter(
        (item: any) => {

          if (
            !fromDate ||
            !toDate
          ) return true;

          return (
            item.inward_date >=
              fromDate &&
            item.inward_date <=
              toDate
          );

        }
      );

    const headers = [

      "Date",
      "Month",
      "Vendor",
      "Invoice No",
      "Material Code",
      "Description",
      "Type",
      "Good Qty",
      "NG Qty",
      "UOM",
      "Tally Ref",
      "Remarks"

    ];

    const rows =
      filtered.map(
        (item: any) => [

          item.inward_date
            ? new Date(
                item.inward_date
              ).toLocaleDateString(
                "en-GB"
              )
            : "",

          item.month,

          item.vendor_name,

          item.invoice_no,

          item.material_code,

          item.material_description,

          item.type_of_material,

          item.g_qty,

          item.ng_qty,

          item.uom,

          item.tally_ref_no,

          item.remarks

        ]
      );

    let csvContent =
      headers.join(",") + "\n";

    rows.forEach((row: any) => {

      csvContent +=
        row.join(",") + "\n";

    });

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "inward_report.csv";

    link.click();

  }

  return (

    <div className="p-4">

      <div className="flex items-center gap-4 mb-4">

        <Link href="/dashboard">

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
        Inward Entry
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-4">

        <input
          type="text"
          value={form.inward_date}
          readOnly
          className="border p-3 rounded"
        />

        <input
          type="text"
          value={form.month}
          readOnly
          className="border p-3 rounded"
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
          className="border p-3 rounded"
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

        <select
          value={form.type_of_inward}
          onChange={(e) =>
            setForm({
              ...form,
              type_of_inward:
                e.target.value
            })
          }
          className="border p-3 rounded"
        >

          <option value="">
            Select Type Of Inward
          </option>

          <option value="New Inward">
            New Inward
          </option>

          <option value="Return">
            Return
          </option>

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

          {Array.isArray(materials) &&
            materials.map(
              (
                item: any,
                index: number
              ) => (

                <option
                  key={index}
                  value={
                    item.material ||

                    item.material_code ||

                    item.code
                  }
                >

                  {
                    item.material ||

                    item.material_code ||

                    item.code
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
          className="border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Type Of Material"
          value={
            form.type_of_material
          }
          readOnly
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="G Qty"
          value={form.g_qty}
          onChange={(e) =>
            setForm({
              ...form,
              g_qty:
                e.target.value
            })
          }
          className="border p-3 rounded"
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
          className="border p-3 rounded"
        />

        <input
          type="text"
          placeholder="UOM"
          value={form.uom}
          readOnly
          className="border p-3 rounded"
        />

        <input
          type="text"
          placeholder="Tally Ref No"
          value={form.tally_ref_no}
          onChange={(e) =>
            setForm({
              ...form,
              tally_ref_no:
                e.target.value
            })
          }
          className="border p-3 rounded"
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
          className="border p-3 rounded"
        />

      </div>

      <button
        onClick={handleSubmit}
        className="
          bg-black
          text-white
          px-6
          py-3
          rounded
          mb-6
          w-full
        "
      >
        Save Inward
      </button>

      <div className="flex gap-4 mb-4">

        <input
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(
              e.target.value
            )
          }
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(
              e.target.value
            )
          }
          className="border p-2 rounded"
        />

        <button
          onClick={downloadCSV}
          className="
            bg-green-600
            text-white
            px-4
            py-2
            rounded
          "
        >
          Download CSV
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
                Vendor
              </th>

              <th className="border p-2">
                Invoice No
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                Type
              </th>

              <th className="border p-2">
                G Qty
              </th>

              <th className="border p-2">
                NG Qty
              </th>

              <th className="border p-2">
                UOM
              </th>

              <th className="border p-2">
                Tally Ref
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
                        ? new Date(
                            item.inward_date
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : ""
                    }

                  </td>

                  <td className="border p-2">
                    {
                      item.month
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

                  <td className="border p-2 font-bold">
                    {
                      item.material_code
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.material_description
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.type_of_material
                    }
                  </td>

                  <td className="border p-2 text-green-600 font-bold">
                    {
                      item.g_qty
                    }
                  </td>

                  <td className="border p-2 text-red-600 font-bold">
                    {
                      item.ng_qty
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.uom
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.tally_ref_no
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