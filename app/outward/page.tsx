"use client";

import { useEffect, useState } from "react";

export default function OutwardPage() {

  const today = new Date();

  today.setMinutes(
    today.getMinutes() -
    today.getTimezoneOffset()
  );

  const formattedDate =
    today.toISOString().split("T")[0];

  const currentMonth =
    today.toLocaleString(
      "default",
      {
        month: "long"
      }
    );

  const currentYear =
    today.getFullYear();

  const [outwardData, setOutwardData] =
    useState<any[]>([]);

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [reqPersons, setReqPersons] =
    useState<any[]>([]);

  const [vendorDepts, setVendorDepts] =
    useState<any[]>([]);

  const [dateFilter, setDateFilter] =
    useState({

      from_date: "",

      to_date: ""

    });

  const [form, setForm] = useState({

    req_date: formattedDate,

    month:
      currentMonth +
      " " +
      currentYear,

    req_person: "",

    to_vendor_dept: "",

    job_card_po_no: "",

    material_code: "",

    description: "",

    req_qty: "",

    g_outward_qty: "",

    ng_outward_qty: "",

    uom: "",

    issuance_date:
      formattedDate,

    tally_ref_no: "",

    remarks: ""

  });

  useEffect(() => {

    fetchAllData();

  }, []);

  async function fetchAllData() {

    try {

      const outwardRes =
        await fetch(
          "/api/outward",
          {
            cache: "no-store"
          }
        );

      const outwardJson =
        await outwardRes.json();

      if (
        Array.isArray(outwardJson)
      ) {

        setOutwardData(
          outwardJson
        );

      }

      const materialRes =
        await fetch(
          "/api/materials"
        );

      const materialJson =
        await materialRes.json();

      if (
        Array.isArray(materialJson)
      ) {

        setMaterials(
          materialJson
        );

      }

      const reqRes =
        await fetch(
          "/api/req-person"
        );

      const reqJson =
        await reqRes.json();

      if (
        Array.isArray(reqJson)
      ) {

        setReqPersons(
          reqJson
        );

      }

      const vendorRes =
        await fetch(
          "/api/vendor-dept"
        );

      const vendorJson =
        await vendorRes.json();

      if (
        Array.isArray(vendorJson)
      ) {

        setVendorDepts(
          vendorJson
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
          "/api/outward",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                req_date:
                  form.req_date,

                month:
                  form.month,

                req_person:
                  form.req_person,

                to_vendor_dept:
                  form.to_vendor_dept,

                job_card_po_no:
                  form.job_card_po_no,

                material_code:
                  form.material_code,

                material_description:
                  form.description,

                type_of_material:
                  "",

                req_qty:
                  Number(
                    form.req_qty || 0
                  ),

                g_outward_qty:
                  Number(
                    form.g_outward_qty || 0
                  ),

                ng_outward_qty:
                  Number(
                    form.ng_outward_qty || 0
                  ),

                uom:
                  form.uom,

                issuance_date:
                  form.issuance_date,

                tally_ref_no:
                  form.tally_ref_no,

                remarks:
                  form.remarks

              })

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Outward Saved Successfully"
        );

        await fetchAllData();

        setForm({

          req_date:
            formattedDate,

          month:
            currentMonth +
            " " +
            currentYear,

          req_person: "",

          to_vendor_dept: "",

          job_card_po_no: "",

          material_code: "",

          description: "",

          req_qty: "",

          g_outward_qty: "",

          ng_outward_qty: "",

          uom: "",

          issuance_date:
            formattedDate,

          tally_ref_no: "",

          remarks: ""

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
          selected.description || "",

        uom:
          selected.uom || "Nos"

      });

    }

  }

  function formatDate(
    dateString: string
  ) {

    if (!dateString) return "";

    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      "en-IN"
    );

  }

  function downloadCSV() {

    const filteredRows =
      outwardData.filter(
        (item: any) => {

          if (
            !dateFilter.from_date ||
            !dateFilter.to_date
          ) {
            return true;
          }

          const issuanceDate =
            new Date(
              item.issuance_date
            );

          const fromDate =
            new Date(
              dateFilter.from_date
            );

          const toDate =
            new Date(
              dateFilter.to_date
            );

          return (
            issuanceDate >= fromDate &&
            issuanceDate <= toDate
          );

        }
      );

    const headers = [

      "Req Date",

      "Month",

      "Req Person",

      "Vendor / Dept",

      "Job Card",

      "Material Code",

      "Description",

      "Req Qty",

      "G Qty",

      "NG Qty",

      "UOM",

      "Issuance Date",

      "Tally Ref",

      "Remarks"

    ];

    const rows =
      filteredRows.map(
        (item: any) => [

          formatDate(
            item.req_date
          ),

          item.month,

          item.req_person,

          item.to_vendor_dept,

          item.job_card_po_no,

          item.material_code,

          item.material_description,

          item.req_qty,

          item.g_outward_qty,

          item.ng_outward_qty,

          item.uom,

          formatDate(
            item.issuance_date
          ),

          item.tally_ref_no,

          item.remarks

        ]
      );

    const csvContent = [

      headers.join(","),

      ...rows.map(
        (e: any) =>
          e.join(",")
      )

    ].join("\n");

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const link =
      document.createElement("a");

    const url =
      URL.createObjectURL(blob);

    link.setAttribute(
      "href",
      url
    );

    link.setAttribute(
      "download",
      "outward_report.csv"
    );

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Outward Entry
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-4 gap-4 mb-8"
      >

        <input
          type="date"
          value={form.req_date}
          onChange={(e) =>
            setForm({
              ...form,
              req_date:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          value={form.month}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <select
          value={form.req_person}
          onChange={(e) =>
            setForm({
              ...form,
              req_person:
                e.target.value
            })
          }
          className="border p-2 rounded"
        >

          <option value="">
            Select Req Person
          </option>

          {reqPersons.map(
            (item: any) => (

              <option
                key={item.id}
                value={
                  item.req_person
                }
              >
                {item.req_person}
              </option>

            )
          )}

        </select>

        <select
          value={form.to_vendor_dept}
          onChange={(e) =>
            setForm({
              ...form,
              to_vendor_dept:
                e.target.value
            })
          }
          className="border p-2 rounded"
        >

          <option value="">
            Select Vendor / Dept
          </option>

          {vendorDepts.map(
            (item: any) => (

              <option
                key={item.id}
                value={
                  item.vendor_dept
                }
              >
                {item.vendor_dept}
              </option>

            )
          )}

        </select>

        <input
          type="text"
          placeholder="Job Card / PO No"
          value={form.job_card_po_no}
          onChange={(e) =>
            setForm({
              ...form,
              job_card_po_no:
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
          value={form.description}
          readOnly
          placeholder="Description"
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="number"
          placeholder="Req Qty"
          value={form.req_qty}
          onChange={(e) =>
            setForm({
              ...form,
              req_qty:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="G Outward Qty"
          value={form.g_outward_qty}
          onChange={(e) =>
            setForm({
              ...form,
              g_outward_qty:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="NG Outward Qty"
          value={form.ng_outward_qty}
          onChange={(e) =>
            setForm({
              ...form,
              ng_outward_qty:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          value={form.uom}
          readOnly
          placeholder="UOM"
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="date"
          value={form.issuance_date}
          readOnly
          className="border p-2 rounded bg-gray-100"
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
          type="submit"
          className="bg-black text-white p-2 rounded"
        >
          Save Outward
        </button>

      </form>

      <div className="flex gap-4 mb-4">

        <input
          type="date"
          value={dateFilter.from_date}
          onChange={(e) =>
            setDateFilter({
              ...dateFilter,
              from_date:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={dateFilter.to_date}
          onChange={(e) =>
            setDateFilter({
              ...dateFilter,
              to_date:
                e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <button
          type="button"
          onClick={downloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download CSV
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Req Date
              </th>

              <th className="border p-2">
                Month
              </th>

              <th className="border p-2">
                Req Person
              </th>

              <th className="border p-2">
                Vendor / Dept
              </th>

              <th className="border p-2">
                Job Card
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                Req Qty
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
                Issuance Date
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

            {outwardData &&
            outwardData.length > 0 ? (

              outwardData.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={index}>

                    <td className="border p-2">
                      {
                        formatDate(
                          item.req_date
                        )
                      }
                    </td>

                    <td className="border p-2">
                      {item.month}
                    </td>

                    <td className="border p-2">
                      {item.req_person}
                    </td>

                    <td className="border p-2">
                      {
                        item.to_vendor_dept
                      }
                    </td>

                    <td className="border p-2">
                      {
                        item.job_card_po_no
                      }
                    </td>

                    <td className="border p-2">
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
                      {item.req_qty}
                    </td>

                    <td className="border p-2">
                      {
                        item.g_outward_qty
                      }
                    </td>

                    <td className="border p-2">
                      {
                        item.ng_outward_qty
                      }
                    </td>

                    <td className="border p-2">
                      {item.uom}
                    </td>

                    <td className="border p-2">
                      {
                        formatDate(
                          item.issuance_date
                        )
                      }
                    </td>

                    <td className="border p-2">
                      {
                        item.tally_ref_no
                      }
                    </td>

                    <td className="border p-2">
                      {item.remarks}
                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={14}
                  className="border p-4 text-center"
                >
                  No Outward Data Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}