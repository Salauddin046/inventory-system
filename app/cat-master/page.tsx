"use client";

import { useEffect, useState } from "react";

export default function CatMasterPage() {

  const [materials, setMaterials] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    vendor_name: "",
    material_code: "",
    description: "",
    type_of_material: ""
  });

  const [form, setForm] = useState({
    vendor_name: "",
    material_code: "",
    description: "",
    type_of_material: ""
  });

  async function loadMaterials() {

    const res = await fetch("/api/materials", {
      cache: "no-store"
    });

    const data = await res.json();

    setMaterials(data);
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function handleSubmit(e: any) {

    e.preventDefault();

    await fetch("/api/materials", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(form)

    });

    setForm({
      vendor_name: "",
      material_code: "",
      description: "",
      type_of_material: ""
    });

    loadMaterials();
  }

  const filteredMaterials = materials.filter((item: any) => {

    return (

      item.vendor_name
        ?.toLowerCase()
        .includes(filters.vendor_name.toLowerCase())

      &&

      item.material_code
        ?.toLowerCase()
        .includes(filters.material_code.toLowerCase())

      &&

      item.description
        ?.toLowerCase()
        .includes(filters.description.toLowerCase())

      &&

      item.type_of_material
        ?.toLowerCase()
        .includes(filters.type_of_material.toLowerCase())

    );

  });

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        CAT Master
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-4 gap-4 mb-6"
      >

        <input
          type="text"
          placeholder="Vendor Name"
          value={form.vendor_name}
          onChange={(e) =>
            setForm({
              ...form,
              vendor_name: e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Material Code"
          value={form.material_code}
          onChange={(e) =>
            setForm({
              ...form,
              material_code: e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Type Of Material"
          value={form.type_of_material}
          onChange={(e) =>
            setForm({
              ...form,
              type_of_material: e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-black text-white p-2 rounded col-span-4"
        >
          Save Material
        </button>

      </form>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Vendor Name
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                Type Of Material
              </th>

            </tr>

            <tr className="bg-gray-100">

              <th className="border p-1">

                <input
                  type="text"
                  placeholder="Filter Vendor"
                  value={filters.vendor_name}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      vendor_name: e.target.value
                    })
                  }
                  className="w-full p-1 border rounded"
                />

              </th>

              <th className="border p-1">

                <input
                  type="text"
                  placeholder="Filter Material"
                  value={filters.material_code}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      material_code: e.target.value
                    })
                  }
                  className="w-full p-1 border rounded"
                />

              </th>

              <th className="border p-1">

                <input
                  type="text"
                  placeholder="Filter Description"
                  value={filters.description}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      description: e.target.value
                    })
                  }
                  className="w-full p-1 border rounded"
                />

              </th>

              <th className="border p-1">

                <input
                  type="text"
                  placeholder="Filter Type"
                  value={filters.type_of_material}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type_of_material: e.target.value
                    })
                  }
                  className="w-full p-1 border rounded"
                />

              </th>

            </tr>

          </thead>

          <tbody>

            {filteredMaterials.map((item: any) => (

              <tr
                key={item.id}
                className="hover:bg-gray-50"
              >

                <td className="border p-2">
                  {item.vendor_name}
                </td>

                <td className="border p-2">
                  {item.material_code}
                </td>

                <td className="border p-2">
                  {item.description}
                </td>

                <td className="border p-2">
                  {item.type_of_material}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}