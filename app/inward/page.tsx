"use client";

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

      setMaterials(result);

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

      setVendors(result);

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

      setInwardData(result);

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

      type_of_material:
        selected?.type || "",

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

        setForm({

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

          remarks: ""

        });

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
      "Type Of Inward",
      "Invoice No",
      "Material Code",
      "Description",
      "Type Of Material",
      "Good Qty",
      "NG Qty",
      "UOM",
      "Remarks"

    ];

    const rows =
      filtered.map(
        (item: any) => [

          item.inward_date,
          item.month,
          item.vendor_name,
          item.type_of_inward,
          item.invoice_no,
          item.material_code,
          item.description,
          item.type_of_material,
          item.g_qty,
          item.ng_qty,
          item.uom,
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

    </div>

  );

}