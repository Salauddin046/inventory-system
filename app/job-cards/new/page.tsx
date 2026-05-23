"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Material {
  id: number;
  material_code: string;
  description: string;
  uom?: string;
}

interface ItemRow {
  material_code: string;
  description: string;
  requested_qty: string;
}

function emptyRow(): ItemRow {
  return { material_code: "", description: "", requested_qty: "" };
}

export default function NewJobCardPage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [materials, setMaterials] = useState<Material[]>([]);
  const [requester, setRequester] = useState("");
  const [requestDate, setRequestDate] = useState(today);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const response = await fetch("/api/materials", { cache: "no-store" });
      if (!response.ok) {
        setError("Failed to load materials list");
        return;
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setMaterials(result);
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading materials");
    }
  }

  function updateRow(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function handleMaterialChange(index: number, code: string) {
    const material = materials.find((m) => m.material_code === code);
    setItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              material_code: code,
              description: material?.description || "",
            }
          : row
      )
    );
  }

  function addRow() {
    setItems((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    if (items.length === 1) {
      setError("At least one material is required");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!requester.trim()) {
      setError("Requester is required");
      return;
    }

    if (!requestDate) {
      setError("Request date is required");
      return;
    }

    // Validate items
    const validatedItems = [];
    const seenCodes = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const row = items[i];

      if (!row.material_code) {
        setError(`Row ${i + 1}: select a material`);
        return;
      }

      if (seenCodes.has(row.material_code)) {
        setError(`Row ${i + 1}: ${row.material_code} appears more than once`);
        return;
      }
      seenCodes.add(row.material_code);

      const qty = Number(row.requested_qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(`Row ${i + 1}: quantity must be greater than 0`);
        return;
      }

      validatedItems.push({
        material_code: row.material_code,
        description: row.description,
        requested_qty: qty,
      });
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/job-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester: requester.trim(),
          request_date: requestDate,
          remarks: remarks.trim() || null,
          items: validatedItems,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        router.push("/job-cards");
        router.refresh();
      } else {
        setError(result.error || "Failed to create job card");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/job-cards">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">New Job Card</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Requester <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
              placeholder="Production / Operation name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Request Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={submitting}
              className="w-full border p-2 rounded"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Materials Required</h2>

        <div className="overflow-x-auto mb-4">
          <table className="w-full border border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-center w-12">#</th>
                <th className="border p-2 text-center">Material Code</th>
                <th className="border p-2 text-center">Description</th>
                <th className="border p-2 text-center w-32">Quantity</th>
                <th className="border p-2 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">
                    <select
                      value={row.material_code}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
                      disabled={submitting}
                      className="border p-1 rounded w-full"
                    >
                      <option value="">Select material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.material_code}>
                          {m.material_code}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.description}
                      readOnly
                      className="border p-1 rounded w-full bg-gray-100"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.requested_qty}
                      onChange={(e) =>
                        updateRow(index, "requested_qty", e.target.value)
                      }
                      disabled={submitting}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={submitting || items.length === 1}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={submitting}
          className="bg-gray-700 text-white px-4 py-2 rounded mb-6"
        >
          + Add Material
        </button>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Job Card"}
          </button>

          <Link href="/job-cards">
            <button
              type="button"
              disabled={submitting}
              className="bg-gray-500 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}