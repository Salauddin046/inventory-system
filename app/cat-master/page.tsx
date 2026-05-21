"use client";

import { useState } from "react";

export default function CatMasterPage() {

  const [materialData, setMaterialData] =
    useState({

      material_code: "",

      description: "",

      type_of_material: "",

      uom: ""

    });

  const [reqPerson, setReqPerson] =
    useState("");

  const [vendorDept, setVendorDept] =
    useState("");

  async function saveMaterial() {

    await fetch(
      "/api/materials",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(materialData)

      }
    );

    alert("Material Saved");

  }

  async function saveReqPerson() {

    await fetch(
      "/api/req-person",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            req_person:
              reqPerson
          })

      }
    );

    alert("Req Person Saved");

  }

  async function saveVendorDept() {

    await fetch(
      "/api/vendor-dept",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            vendor_dept:
              vendorDept
          })

      }
    );

    alert("Vendor / Dept Saved");

  }

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        CAT Master
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Material Master
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Material Code"
              value={
                materialData.material_code
              }
              onChange={(e) =>
                setMaterialData({
                  ...materialData,
                  material_code:
                    e.target.value
                })
              }
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Description"
              value={
                materialData.description
              }
              onChange={(e) =>
                setMaterialData({
                  ...materialData,
                  description:
                    e.target.value
                })
              }
              className="border p-2 rounded w-full"
            />

            <select
              value={
                materialData.type_of_material
              }
              onChange={(e) =>
                setMaterialData({
                  ...materialData,
                  type_of_material:
                    e.target.value
                })
              }
              className="border p-2 rounded w-full"
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
              value={materialData.uom}
              onChange={(e) =>
                setMaterialData({
                  ...materialData,
                  uom:
                    e.target.value
                })
              }
              className="border p-2 rounded w-full"
            >

              <option value="">
                Select UOM
              </option>

              <option value="Nos">
                Nos
              </option>

            </select>

            <button
              onClick={saveMaterial}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>

          </div>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Req Person Master
          </h2>

          <input
            type="text"
            placeholder="Req Person"
            value={reqPerson}
            onChange={(e) =>
              setReqPerson(
                e.target.value
              )
            }
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={saveReqPerson}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Save
          </button>

        </div>

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Vendor / Dept Master
          </h2>

          <input
            type="text"
            placeholder="Vendor / Dept"
            value={vendorDept}
            onChange={(e) =>
              setVendorDept(
                e.target.value
              )
            }
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={saveVendorDept}
            className="bg-purple-600 text-white px-6 py-2 rounded"
          >
            Save
          </button>

        </div>

      </div>

    </div>

  );

}