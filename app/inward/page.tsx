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

      tally_ref_no: "",

      remarks: ""

    });

  useEffect(() => {

    fetchMaterials();

    fetchVendors();

    fetchInwardData();

  }, []);

  async function fetchMaterials() {

    const response =
      await fetch(
        "/api/material-master"
      );

    const result =
      await response.json();

    setMaterials(result);

  }

  async function fetchVendors() {

    const response =
      await fetch(
        "/api/vendor-dept"
      );

    const result =
      await response.json();

    setVendors(result);

  }

  async function fetchInwardData() {

    const response =
      await fetch(
        "/api/inward"
      );

    const result =
      await response.json();

    setInwardData(result);

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
        selected?.type_of_material || "",

      uom:
        selected?.uom || ""

    });

  }

  async function handleSubmit() {

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

    </div>

  );

}