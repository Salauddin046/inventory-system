"use client";

import { useEffect, useState } from "react";

export default function InwardPage() {

  const [inwardData, setInwardData] = useState<any[]>([]);

  const [materials, setMaterials] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    vendor_name: "",
    material_code: "",
    material_description: ""
  });

  const [form, setForm] = useState({
    vendor_name: "",
    material_code: "",
    material_description: "",
    g_qty: ""
  });

  async function loadInward() {

    const res = await fetch("/api/inward", {
      cache: "no-store"
    });

    const data = await res.json();

    setInwardData(data);
  }

  async function loadMaterials() {

    const res = await fetch("/api/materials");

    const data = await res.json();

    setMaterials(data);
  }

  useEffect(() => {

    loadInward();

    loadMaterials();

  }, []);

  async function handleSubmit(e: any) {

    e.preventDefault();

    await fetch("/api/inward", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(form)

    });

    setForm({
      vendor_name: "",
      material_code: "",
      material_description: "",
      g_qty: ""
    });

    loadInward();
  }

  function handleMaterialChange(code: string) {

    const selected = materials.find(
      (item: any) => item.material_code === code
    );

    if (selected) {

      setForm({
        ...form,
        material_code: selected.material_code,
        material_description: selected.description
      });

    }
  }

  const filteredData = inwardData.filter((item: any) => {

    return (

      item.vendor_name
        ?.toLowerCase()
        .includes(filters.vendor_name.toLowerCase())

      &&

      item.material_code
        ?.toLowerCase()
        .includes(filters.material_code.toLowerCase())

      &&

      item.material_description
        ?.toLowerCase()
        .includes(filters.material_description.toLowerCase())

    );

  });

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Inward Entry
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

        <select
          value={form.material_code}
          onChange={(e) =>
            handleMaterialChange(e.target.value)
          }
          className="border p-2 rounded"
        >

          <option value="">
            Select Material
          </option>

          {materials.map((item: any) => (

            <option
              key={item.id}
              value={item.material_code}
            >

              {item.material_code}

            </option>

          ))}

        </select>

        <input
          type="text"
          placeholder="Description"
          value={form.material_description}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="number"
          placeholder="G Qty"
          value={form.g_qty}
          onChange={(e) =>
            setForm({
              ...form,
              g_qty: e.target.value
            })
          }
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-black text-white p-2 rounded w-40"
        >
          Save Inward
        </button>

      </form>

      <div className="overflow-x-auto">

        <table className="w-full border border-collapse">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">
                Vendor
              </th>

              <th className="border p-2">
                Material Code
              </th>

              <th className="border p-2">
                Description
              </th>

              <th className="border p-2">
                G Qty
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
                  className="w-full border p-1 rounded"
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
                  className="w-full border p-1 rounded"
                />

              </th>

              <th className="border p-1">

                <input
                  type="text"
                  placeholder="Filter Description"
                  value={filters.material_description}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      material_description: e.target.value
                    })
                  }
                  className="w-full border p-1 rounded"
                />

              </th>

              <th className="border p-1"></th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map((item: any) => (

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
                  {item.material_description}
                </td>

                <td className="border p-2">
                  {item.g_qty}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}