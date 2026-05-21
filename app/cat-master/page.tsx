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
          "Material Added Successfully"
        );

        setFormData({

          material_code: "",

          description: "",

          uom: "",

          req_person: "",

          vendor_or_dept: ""

        });

        fetchMaterials();

      }

    } catch (error) {

      console.log(error);

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

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        CAT Master
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

        <div>

          <label className="block mb-1 font-medium">
            Material Code
          </label>

          <input
            type="text"
            value={formData.material_code}
            onChange={(e) =>
              setFormData({
                ...formData,
                material_code:
                  e.target.value
              })
            }
            className="border p-2 rounded w-full"
          />

        </div>

        <div>

          <label className="block mb-1 font-medium">
            Description
          </label>

          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value
              })
            }
            className="border p-2 rounded w-full"
          />

        </div>

        <div>

          <label className="block mb-1 font-medium">
            UOM
          </label>

          <input
            type="text"
            value={formData.uom}
            onChange={(e) =>
              setFormData({
                ...formData,
                uom:
                  e.target.value
              })
            }
            className="border p-2 rounded w-full"
          />

        </div>

        <div>

          <label className="block mb-1 font-medium">
            Req Person
          </label>

          <input
            type="text"
            value={formData.req_person}
            onChange={(e) =>
              setFormData({
                ...formData,
                req_person:
                  e.target.value
              })
            }
            className="border p-2 rounded w-full"
          />

        </div>

        <div>

          <label className="block mb-1 font-medium">
            Vendor / Dept
          </label>

          <input
            type="text"
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
            className="border p-2 rounded w-full"
          />

        </div>

      </div>

      <button
        type="button"
        onClick={saveMaterial}
        className="bg-blue-600 text-white px-6 py-2 rounded mb-6"
      >
        Save Material
      </button>

      <div className="flex justify-end mb-4">

        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-2 rounded w-80"
        />

      </div>

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
                UOM
              </th>

              <th className="border p-2">
                Req Person
              </th>

              <th className="border p-2">
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

                <tr key={index}>

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