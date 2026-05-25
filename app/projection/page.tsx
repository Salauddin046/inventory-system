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
  projection_action: string | null;
  stock_qty: number | string;
  stock_action: string | null;
  allocated_qty?: number;
  returned_live_stock?: number;
  balance_qty?: number;
  has_linked_outwards?: boolean;
}

interface MessageState {
  type: "success" | "error";
  text: string;
}

const COLUMNS = [
  "Projection Month",
  "Revision No",
  "Material Code",
  "Description",
  "Projection Qty",
  "Allocated",
  "Projection Action",
  "Projection Submit",
  "Stock Qty",
  "Stock Action",
  "Stock Submit",
  "Outward Qty",
  "Balance",
  "Clear Projection",
];

export default function ProjectionPage() {
  const [projectionData, setProjectionData] = useState<ProjectionRow[]>([]);
  const [linkedSet, setLinkedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, outRes, meRes] = await Promise.all([
        fetch("/api/projection", { cache: "no-store" }),
        fetch("/api/outward", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" }),
      ]);

      const projResult = await projRes.json();
      const outResult = await outRes.json();
      const meResult = await meRes.json().catch(() => ({}));

      if (Array.isArray(projResult)) {
        setProjectionData(projResult);
      } else {
        showMessage("error", projResult.error || "Failed to load projections");
      }

      if (Array.isArray(outResult)) {
        const linkedIds = new Set<number>();
        outResult.forEach((o: any) => {
          if (o.projection_id) linkedIds.add(Number(o.projection_id));
        });
        setLinkedSet(linkedIds);
      }

      const me = meResult?.user;
      if (me && me.isAdmin) setCurrentUserIsAdmin(true);
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error loading data");
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
    if (!currentUserIsAdmin) {
      showMessage("error", "Only admin can change projection action");
      return;
    }

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
    if (!currentUserIsAdmin) {
      showMessage("error", "Only admin can change stock action");
      return;
    }

    if (!item.stock_action) {
      showMessage("error", "Select Stock Action");
      return;
    }

    const qty = Number(item.stock_qty);

    if (item.stock_action === "Issue") {
      if (!Number.isFinite(qty) || qty <= 0) {
        showMessage("error", "Enter a valid Stock Quantity before Issue");
        return;
      }
      if (qty > Number(item.projection_qty || 0)) {
        showMessage("error", "Issue Quantity cannot exceed Projection Quantity");
        return;
      }
    }

    setSubmittingId(item.id);
    try {
      const response = await fetch("/api/projection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          stock_qty: item.stock_action === "Issue" ? qty : 0,
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
    if (!currentUserIsAdmin) {
      showMessage("error", "Only admin can clear projections");
      return;
    }

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
        {currentUserIsAdmin && (
          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
            Admin
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2">Projection Master</h1>
      {!currentUserIsAdmin && (
        <p className="text-sm text-gray-600 mb-4">
          View only. Only admin can allocate or modify projections.
        </p>
      )}

      {message ? (
        <div
          className={
            message.type === "success"
              ? "mb-4 p-3 rounded bg-green-100 text-green-800"
              : "mb-4 p-3 rounded bg-red-100 text-red-800"
          }
        >
          {message.text}
        </div>
      ) : null}

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
                const hasLinkedOutwards = linkedSet.has(item.id);
                const isAutoLinked = hasLinkedOutwards;

                // Manual stock action disabled if auto-linked outwards exist
                // Projection action disabled if not admin or if auto-linked
                const projectionActionDisabled =
                  !currentUserIsAdmin || isSubmitting || isAutoLinked;
                const stockActionDisabled =
                  !currentUserIsAdmin || isSubmitting || isAutoLinked;
                const clearDisabled =
                  !currentUserIsAdmin || isSubmitting || hasLinkedOutwards;

                return (
                  <tr key={item.id} className={isAutoLinked ? "bg-blue-50" : ""}>
                    <td className="border p-2 text-center">{item.projection_month}</td>
                    <td className="border p-2 text-center">{item.revision_no}</td>
                    <td className="border p-2 text-center font-bold">{item.material_code}</td>
                    <td className="border p-2 text-center">{item.description}</td>
                    <td className="border p-2 text-center text-blue-600 font-bold">
                      {item.projection_qty}
                    </td>
                    <td className="border p-2 text-center font-medium">
                      {item.allocated_qty || 0}
                    </td>

                    <td className="border p-2">
                      <select
                        value={item.projection_action || ""}
                        disabled={projectionActionDisabled}
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
                        disabled={projectionActionDisabled}
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
                        disabled={stockActionDisabled}
                        onChange={(e) => handleChange(index, "stock_qty", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    <td className="border p-2">
                      <select
                        value={item.stock_action || ""}
                        disabled={stockActionDisabled}
                        onChange={(e) => handleChange(index, "stock_action", e.target.value)}
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
                        disabled={stockActionDisabled}
                        title={
                          isAutoLinked
                            ? "Stock action is auto-updated by Outward saves for this projection"
                            : ""
                        }
                        className="bg-black text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "..." : "Submit"}
                      </button>
                    </td>

                    <td className="border p-2 text-center text-red-600 font-bold">
                      {item.stock_qty || 0}
                    </td>

                    <td className="border p-2 text-center text-green-600 font-bold">
                      {item.balance_qty || 0}
                    </td>

                    <td className="border p-2 text-center">
                      <button
                        onClick={() => clearProjection(item.id)}
                        disabled={clearDisabled}
                        title={hasLinkedOutwards ? "Cannot delete: outwards are linked" : ""}
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="mt-4 text-xs text-gray-500">
        Blue-highlighted rows have outward transactions linked. Manual stock action is locked for those rows.
      </div>
    </div>
  );
}