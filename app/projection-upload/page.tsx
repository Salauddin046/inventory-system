"use client";

import { useEffect, useState } from "react";

export default function ProjectionUploadPage() {

  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [rows, setRows] =
    useState([
      {
        projection_month: "",
        revision_no: "",
        material_code: "",
        description: "",
        qty: "",
        uom: ""
      }
    ]);

  useEffect(() => {

    fetchMaterials();

  }, []);

  async function fetchMaterials() {

    try {

      const response =
        await fetch(
          "/api/materials"
        );

      const result =
        await response.json();

      setMaterials(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (error) {

      console.log(error);

    }

  }

  function handleChange(
    index: number,
    field: string,
    value: string
  ) {

    const updatedRows =
      [...rows];

    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value
    };

    if (
      field === "material_code"
    ) {

      const selected =
        materials.find(
          (item: any) =>
            item.material_code === value
        );

      if (selected) {

        updatedRows[index]
          .description =
            selected.description || "";

        updatedRows[index]
          .uom =
            selected.uom || "";

      }

    }

    setRows(updatedRows);

  }

  function addRow() {

    setRows([
      ...rows,
      {
        projection_month: "",
        revision_no: "",
        material_code: "",
        description: "",
        qty: "",
        uom: ""
      }
    ]);

  }

  async function saveManualData() {

    try {

      const response =
        await fetch(
          "/api/projection-upload/manual",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(rows)

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Projection Saved Successfully"
        );

        setRows([
          {
            projection_month: "",
            revision_no: "",
            material_code: "",
            description: "",
            qty: "",
            uom: ""
          }
        ]);

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function handleUpload() {

    if (!file) {

      alert("Select CSV File");

      return;

    }

    try {

      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/projection-upload",
          {
            method: "POST",
            body: formData
          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "CSV Uploaded Successfully"
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setUploading(false);

    }

  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Projection Upload
      </h1>

      <div className="border p-6 rounded mb-8 bg-white shadow">

        <h2 className="text-xl font-bold mb-4">
          CSV Upload
        </h2>

        <div className="flex gap-4 items-center flex-wrap">

          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
            className="border p-2 rounded"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-black text-white px-6 py-2 rounded"
          >

            {uploading
              ? "Uploading..."
              : "Upload CSV"}

          </button>

          <a
            href="/sample_projection.csv"
            download
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Download Sample CSV
          </a>

        </div>

      </div>

      <div className="border p-6 rounded bg-white shadow">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-bold">
            Manual Entry
          </h2>

          <button
            type="button"
            onClick={addRow}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Row
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border border-collapse">

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
                  Qty
                </th>

                <th className="border p-2">
                  UOM
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map(
                (
                  row,
                  index
                ) => (

                  <tr key={index}>

                    <td className="border p-2">

                      <input
                        type="text"
                        value={
                          row.projection_month
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "projection_month",
                            e.target.value
                          )
                        }
                        placeholder="Ex: May-2026"
                        className="w-full p-2 border rounded"
                      />

                    </td>

                    <td className="border p-2">

                      <input
                        type="text"
                        value={
                          row.revision_no
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "revision_no",
                            e.target.value
                          )
                        }
                        placeholder="Ex: R1"
                        className="w-full p-2 border rounded"
                      />

                    </td>

                    <td className="border p-2">

                      <input
                        type="text"
                        value={
                          row.material_code
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "material_code",
                            e.target.value
                          )
                        }
                        placeholder="Type Material Code"
                        className="w-full p-2 border rounded"
                        list={`material-list-${index}`}
                      />

                      <datalist
                        id={`material-list-${index}`}
                      >

                        {materials
                          .filter(
                            (item: any) =>
                              item.material_code
                                ?.toLowerCase()
                                .includes(
                                  row.material_code.toLowerCase()
                                )
                          )
                          .map(
                            (item: any) => (

                              <option
                                key={item.id}
                                value={
                                  item.material_code
                                }
                              />

                            )
                          )}

                      </datalist>

                    </td>

                    <td className="border p-2">

                      <input
                        type="text"
                        value={
                          row.description
                        }
                        readOnly
                        className="w-full p-2 bg-gray-100 rounded"
                      />

                    </td>

                    <td className="border p-2">

                      <input
                        type="number"
                        value={
                          row.qty
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "qty",
                            e.target.value
                          )
                        }
                        placeholder="Enter Qty"
                        className="w-full p-2 border rounded"
                      />

                    </td>

                    <td className="border p-2">

                      <input
                        type="text"
                        value={
                          row.uom
                        }
                        readOnly
                        className="w-full p-2 bg-gray-100 rounded"
                      />

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        <button
          type="button"
          onClick={saveManualData}
          className="bg-green-600 text-white px-6 py-2 rounded mt-4"
        >
          Save Projection
        </button>

      </div>

    </div>

  );

}