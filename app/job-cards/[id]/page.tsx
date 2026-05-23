"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface JobCardItem {
  id: number;
  material_code: string;
  description: string | null;
  requested_qty: string | number;
  issued_qty: string | number;
  status: string;
  uom: string | null;
}

interface JobCardDetail {
  id: number;
  job_card_no: string;
  requester: string;
  request_date: string;
  request_type: string | null;
  from_store: string | null;
  to_department: string | null;
  reason: string | null;
  status: string;
  remarks: string | null;
  created_at: string;
  items: JobCardItem[];
}

const ITEM_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Issued: "bg-green-100 text-green-800",
};

const JC_STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Closed: "bg-green-100 text-green-800",
};

export default function JobCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<JobCardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issueQty, setIssueQty] = useState<Record<number, string>>({});
  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/job-cards/${id}`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || `Failed to load (${response.status})`);
        return;
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function formatDate(s: string) {
    if (!s) return "";
    try {
      return new Date(s).toLocaleDateString("en-GB");
    } catch {
      return s;
    }
  }

  function monthYear(s: string) {
    if (!s) return "";
    try {
      return new Date(s).toLocaleString("default", { month: "long", year: "numeric" });
    } catch {
      return "";
    }
  }

  async function handleIssue(item: JobCardItem) {
    const qty = Number(issueQty[item.id]);
    if (!Number.isFinite(qty) || qty <= 0) {
      showMessage("error", "Enter a valid issue quantity");
      return;
    }

    const requested = Number(item.requested_qty);
    const alreadyIssued = Number(item.issued_qty || 0);
    const remaining = requested - alreadyIssued;

    if (qty > remaining) {
      showMessage("error", `Cannot issue more than remaining (${remaining})`);
      return;
    }

    setSubmittingItemId(item.id);
    try {
      const response = await fetch(`/api/job-cards/${id}/items/${item.id}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issued_qty: qty }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showMessage("success", `Issued ${qty} units`);
        setIssueQty((prev) => ({ ...prev, [item.id]: "" }));
        fetchData();
      } else {
        showMessage("error", result.error || "Issue failed");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error");
    } finally {
      setSubmittingItemId(null);
    }
  }

  async function handleDelete() {
    if (!data) return;

    if (data.status === "Closed") {
      showMessage("error", "Cannot delete a closed job card");
      return;
    }

    if (!confirm(`Delete job card ${data.job_card_no}? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/job-cards/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        router.push("/job-cards");
        router.refresh();
      } else {
        showMessage("error", result.error || "Delete failed");
        setDeleting(false);
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Link href="/job-cards">
          <button className="bg-gray-700 text-white px-4 py-2 rounded mb-4">Back</button>
        </Link>
        <div className="p-3 rounded bg-red-100 text-red-800">{error || "Job card not found"}</div>
      </div>
    );
  }

  const isClosed = data.status === "Closed";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/job-cards">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting || isClosed}
          title={isClosed ? "Closed job cards cannot be deleted" : ""}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting..." : "Delete Job Card"}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">{data.job_card_no}</h1>

      <div className="flex items-center gap-3 mb-6">
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            JC_STATUS_STYLES[data.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {data.status}
        </span>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
        <div>
          <div className="text-xs text-gray-500 mb-1">Date</div>
          <div className="font-medium">{formatDate(data.request_date)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Month & Year</div>
          <div className="font-medium">{monthYear(data.request_date)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Requested By</div>
          <div className="font-medium">{data.requester}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Type of Request</div>
          <div className="font-medium">{data.request_type || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">From</div>
          <div className="font-medium">{data.from_store || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">To Department</div>
          <div className="font-medium">{data.to_department || "—"}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-gray-500 mb-1">Reason</div>
          <div className="font-medium">{data.reason || "—"}</div>
        </div>
        {data.remarks && (
          <div className="col-span-4">
            <div className="text-xs text-gray-500 mb-1">Remarks</div>
            <div>{data.remarks}</div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3">Materials</h2>

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">#</th>
              <th className="border p-2 text-center">Material Code</th>
              <th className="border p-2 text-center">Description</th>
              <th className="border p-2 text-center">UoM</th>
              <th className="border p-2 text-center">Requested</th>
              <th className="border p-2 text-center">Issued</th>
              <th className="border p-2 text-center">Remaining</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center w-32">Issue Qty</th>
              <th className="border p-2 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => {
              const requested = Number(item.requested_qty);
              const issued = Number(item.issued_qty || 0);
              const remaining = requested - issued;
              const isFullyIssued = item.status === "Issued";
              const isSubmitting = submittingItemId === item.id;

              return (
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-center font-bold">{item.material_code}</td>
                  <td className="border p-2 text-center">{item.description}</td>
                  <td className="border p-2 text-center">{item.uom || "—"}</td>
                  <td className="border p-2 text-center">{requested}</td>
                  <td className="border p-2 text-center text-blue-600 font-medium">{issued}</td>
                  <td className="border p-2 text-center text-orange-600 font-medium">{remaining}</td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ITEM_STATUS_STYLES[item.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={issueQty[item.id] || ""}
                      onChange={(e) =>
                        setIssueQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      disabled={isFullyIssued || isSubmitting}
                      className="border p-1 rounded w-full"
                      placeholder={isFullyIssued ? "—" : String(remaining)}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleIssue(item)}
                      disabled={isFullyIssued || isSubmitting}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                    >
                      {isSubmitting ? "..." : "Issue"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <strong>Note:</strong> Clicking "Issue" only marks the job card as fulfilled. You must
        separately create an outward transaction on the Outward page to reduce live stock.
      </div>
    </div>
  );
}