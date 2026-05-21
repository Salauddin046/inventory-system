"use client";

import { useEffect, useState } from "react";

export default function CatMasterPage() {

  const [materials, setMaterials] =
    useState<any[]>([]);

  const [reqPersons, setReqPersons] =
    useState<any[]>([]);

  const [vendorDepts, setVendorDepts] =
    useState<any[]>([]);

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

  useEffect(() => {

    fetchMaterials();

    fetchReqPersons();

    fetchVendorDepts();

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

      setMaterials(result || []);

    } catch (error) {

      console.log(error);

    }

  }

  async function fetchReqPersons() {

    try {

      const response =
        await fetch(
          "/api/req-person",
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      setReqPersons(result || []);

    } catch (error) {

      console.log(error);

    }

  }

  async function fetchVendorDepts() {

    try {

      const response =
        await fetch(
          "/api/vendor-dept",
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      setVendorDepts(result || []);

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
              JSON.stringify(materialData)

          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert("Material Saved");

        setMaterialData({

          material_code: "",

          description: "",

          type_of_material: "",

          uom: ""

        });

        fetchMaterials();

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function saveReqPerson() {

    try {

      const response =
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

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Req Person Saved"
        );

        setReqPerson("");

        fetchReqPersons();

      }

    } catch (error) {

      console.log(error);

    }

  }

  async function saveVendorDept() {

    try {

      const response =
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

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Vendor / Dept Saved"
        );

        setVendorDept("");

        fetchVendorDepts();

      }

    } catch (error) {

      console.log(error);

    }

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <div className="bg-white rounded shadow overflow-x-auto">

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
                  Type
                </th>

                <th className="border p-3">
                  UOM
                </th>

              </tr>

            </thead>

            <tbody>

              {materials.map(
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
                      {
                        item.type_of_material
                      }
                    </td>

                    <td className="border p-2">
                      {item.uom}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        <div className="bg-white rounded shadow overflow-x-auto">

          <table className="w-full border-collapse text-sm">

            <thead>

              <tr className="bg-green-200">

                <th className="border p-3">
                  Req Person
                </th>

              </tr>

            </thead>

            <tbody>

              {reqPersons.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={index}>

                    <td className="border p-2">
                      {
                        item.req_person
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        <div className="bg-white rounded shadow overflow-x-auto">

          <table className="w-full border-collapse text-sm">

            <thead>

              <tr className="bg-purple-200">

                <th className="border p-3">
                  Vendor / Dept
                </th>

              </tr>

            </thead>

            <tbody>

              {vendorDepts.map(
                (
                  item: any,
                  index: number
                ) => (

                  <tr key={index}>

                    <td className="border p-2">
                      {
                        item.vendor_dept
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}