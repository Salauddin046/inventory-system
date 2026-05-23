"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface ProjectionRow {
  id: number;
  projection_month: string;
  revision_no: number;
  material_code: string;
  description: string;
  projection_qty: number;
  projection_action: "Allocate" | "Un Allocate" | "";
  stock_qty: number | string;
  stock_action: "Issue" | "Not Issue" | "";
  returned_live_stock?: number;
}

const COLUMNS = [
  "Projection Month",
  "Revision No",
  "Material Code",
  "Description",
  "Projection Qty",
  "Projection Action",
  "Projection Submit",
  "Stock Qty",
  "Stock Action",
  "Stock Submit",
  "Outward Qty",
  "Returned Live Stock",
  "Clear Projection",
];

export default function ProjectionPage() {
  const [projectionData, setProjectionData] = useState<ProjectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projection", { cache: "no-store" });
      const result = await response.json();
      if (Array.isArray(result)) {
        setProjectionData(result);
      } else {
        showMessage("error", "Failed to load projections");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error loading projections");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleChange(index: number, field: keyof ProjectionRow, value: string) {
    setProjectionData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function submitProjection(item: ProjectionRow) {
    if (!item.projection_action) {
      showMessage("error", "Select Projection Action");
      return;
    }
    setSubmittingId(item.id);
    try {
      const response = await fetch("/api/projection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          projection_action: item.projection_action,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        showMessage("success", "Projection Updated");
        fetchData();
      } else {
        showMessage("error", result.error || "Projection Update Failed");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Projection Update Failed");
    } finally {
      setSubmittingId(null);
    }
  }

  async function submitStock(item: ProjectionRow) {
    if (!item.stock_action) {
      showMessage("error", "Select Stock Action");
      return;
    }
    const qty = Number(item.stock_qty);
    if (!Number.isFinite(qty) || qty < 0) {
      showMessage("error", "Stock Quantity must be a valid non-negative number");
      return;
    }
    if (item.stock_action === "Issue" && qty <= 0) {
      showMessage("error", "Enter Stock Quantity before issuing");
      return;
    }
    setSubmittingId(item.id);
    try {
      const response = await fetch("/api/projection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          stock_qty: qty,
          stock_action: item.stock_action,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        showMessage("success", "Stock Updated");
        fetchData();
      } else {
        showMessage("error", result.error || "Stock Update Failed");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Stock Update Failed");
    } finally {
      setSubmittingId(null);
    }
  }

  async function clearProjection(id: number) {
    if (!confirm("Clear this projection? This cannot be undone.")) return;
    setSubmittingId(id);
    try {
      const response = await fetch("/api/projection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        showMessage("success", "Projection Cleared");
        fetchData();
      } else {
        showMessage("error", result.error || "Delete Failed");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Delete Failed");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Projection Master</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              {COLUMNS.map((col) => (
                <th key={col} className="border p-2 text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="border p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : projectionData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="border p-4 text-center">
                  No Projection Data Found
                </td>
              </tr>
            ) : (
              projectionData.map((item, index) => {
                const isSubmitting = submittingId === item.id;
                return (
                  <tr key={item.id}>
                    <td className="border p-2 text-center">{item.projection_month}</td>
                    <td className="border p-2 text-center">{item.revision_no}</td>
                    <td className="border p-2 text-center font-bold">
                      {item.material_code}
                    </td>
                    <td className="border p-2 text-center">{item.description}</td>
                    <td className="border p-2 text-center text-blue-600 font-bold">
                      {item.projection_qty}
                    </td>
                    <td className="border p-2">
                      <select
                        value={item.projection_action || ""}
                        disabled={item.stock_action === "Issue" || isSubmitting}
                        onChange={(e) =>
                          handleChange(index, "projection_action", e.target.value)
                        }
                        className="border p-1 rounded w-full"
                      >
                        <option value="">Select</option>
                        <option value="Allocate">Allocate</option>
                        <option value="Un Allocate">Un Allocate</option>
                      </select>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => submitProjection(item)}
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {isSubmitting ? "..." : "Submit"}
                      </button>
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.stock_qty || ""}
                        disabled={isSubmitting}
                        onChange={(e) => handleChange(index, "stock_qty", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        value={item.stock_action || ""}
                        disabled={isSubmitting}
                        onChange={(e) =>
                          handleChange(index, "stock_action", e.target.value)
                        }
                        className="border p-1 rounded w-full"
                      >
                        <option value="">Select</option>
                        <option value="Issue">Issue</option>
                        <option value="Not Issue">Not Issue</option>
                      </select>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => submitStock(item)}
                        disabled={isSubmitting}
                        className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {isSubmitting ? "..." : "Submit"}
                      </button>
                    </td>
                    <td className="border p-2 text-center text-red-600 font-bold">
                      {item.stock_action === "Issue" ? item.stock_qty || 0 : 0}
                    </td>
                    <td className="border p-2 text-center text-green-600 font-bold">
                      {item.returned_live_stock || 0}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => clearProjection(item.id)}
                        disabled={isSubmitting}
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}