"use client";

import { useEffect, useState } from "react";

export default function CatMasterPage() {

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [formData, setFormData] =
    useState({

      material_code: "",

      description: "",

      type_of_material: "",

      uom: "",

      req_person: "",

      vendor_or_dept: ""

    });

  useEffect(() => {

    fetchMaterials();

  }, []);

  async function fetchMaterials() {

    try {

      const response =
        await fetch(
          "/api/materials",
          {
            cache: "no-store"
          }
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

  async function saveMaterial() {

    if (
      !formData.material_code ||
      !formData.description
    ) {

      alert(
        "Enter Required Fields"
      );

      return;

    }

    try {

      const response =
        await fetch(
          "/api/materials",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(formData)

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Material Saved Successfully"
        );

        setFormData({

          material_code: "",

          description: "",

          type_of_material: "",

          uom: "",

          req_person: "",

          vendor_or_dept: ""

        });

        fetchMaterials();

      } else {

        alert(
          result.error ||
          "Failed To Save"
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Error Saving Material"
      );

    }

  }

  const filteredData =
    materials.filter(
      (item: any) =>

        item.material_code
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.description
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.type_of_material
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.req_person
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.vendor_or_dept
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

    );

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          CAT Master
        </h1>

        <input
          type="text"
          placeholder="Search Material"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-2 rounded w-80 bg-white"
        />

      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">

        <h2 className="text-xl font-bold mb-4">
          Material Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <input
            type="text"
            placeholder="Material Code"
            value={formData.material_code}
            onChange={(e) =>
              setFormData({
                ...formData,
                material_code:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          />

          <select
            value={
              formData.type_of_material
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                type_of_material:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          >

            <option value="">
              Select Type
            </option>

            <option value="AH">
              AH
            </option>

            <option value="PH">
              PH
            </option>

            <option value="MH">
              MH
            </option>

          </select>

          <select
            value={formData.uom}
            onChange={(e) =>
              setFormData({
                ...formData,
                uom:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          >

            <option value="">
              Select UOM
            </option>

            <option value="Nos">
              Nos
            </option>

          </select>

        </div>

        <h2 className="text-xl font-bold mb-4">
          Responsibility Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <input
            type="text"
            placeholder="Req Person"
            value={formData.req_person}
            onChange={(e) =>
              setFormData({
                ...formData,
                req_person:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Vendor / Dept"
            value={
              formData.vendor_or_dept
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                vendor_or_dept:
                  e.target.value
              })
            }
            className="border p-2 rounded"
          />

        </div>

        <button
          type="button"
          onClick={saveMaterial}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save Material
        </button>

      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">

        <table className="w-full border-collapse text-sm">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-3">
                Material Code
              </th>

              <th className="border p-3">
                Description
              </th>

              <th className="border p-3">
                Type Of Material
              </th>

              <th className="border p-3">
                UOM
              </th>

              <th className="border p-3">
                Req Person
              </th>

              <th className="border p-3">
                Vendor / Dept
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map(
              (
                item: any,
                index: number
              ) => (

                <tr
                  key={index}
                  className="hover:bg-gray-50"
                >

                  <td className="border p-2">
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
                      item.type_of_material
                    }
                  </td>

                  <td className="border p-2">
                    {item.uom}
                  </td>

                  <td className="border p-2">
                    {
                      item.req_person
                    }
                  </td>

                  <td className="border p-2">
                    {
                      item.vendor_or_dept
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