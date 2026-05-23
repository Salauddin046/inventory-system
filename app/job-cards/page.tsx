"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface JobCardSummary {
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
  total_items: string | number;
  total_requested_qty: string | number;
  total_issued_qty: string | number;
}

interface JobCardDetailItem {
  id: number;
  material_code: string;
  description: string | null;
  uom: string | null;
  requested_qty: string | number;
  issued_qty: string | number;
  status: string;
}

interface JobCardFullDetail extends JobCardSummary {
  items: JobCardDetailItem[];
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Closed: "bg-green-100 text-green-800",
};

function csvEscape(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
    return new Date(s).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function JobCardListPage() {
  const [data, setData] = useState<JobCardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/job-cards", { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || `Failed to load (${response.status})`);
        return;
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading job cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function filterByDate(jc: JobCardSummary): boolean {
    if (!fromDate && !toDate) return true;
    const jcDate = new Date(jc.request_date);
    if (fromDate && jcDate < new Date(fromDate)) return false;
    if (toDate && jcDate > new Date(toDate + "T23:59:59")) return false;
    return true;
  }

  async function downloadCSV() {
    setDownloading(true);
    try {
      const filtered = data.filter(filterByDate);

      if (filtered.length === 0) {
        alert("No job cards in the selected date range");
        setDownloading(false);
        return;
      }

      // Fetch full details for each filtered job card
      const fullDetails: JobCardFullDetail[] = [];
      for (const jc of filtered) {
        const response = await fetch(`/api/job-cards/${jc.id}`);
        if (response.ok) {
          const detail = await response.json();
          fullDetails.push(detail);
        }
      }

      // Build CSV — flat table, one row per material
      const headers = [
        "Job Card No",
        "Date",
        "Month & Year",
        "Requested By",
        "Type of Request",
        "From",
        "To Department",
        "Material Code",
        "Description",
        "UoM",
        "Requested Qty",
        "Issued Qty",
        "Remaining Qty",
        "Item Status",
        "Job Card Status",
        "Remarks",
      ];

      const lines: string[] = [];
      lines.push(headers.map(csvEscape).join(","));

      for (const jc of fullDetails) {
        const items = jc.items || [];

        if (items.length === 0) {
          lines.push(
            [
              jc.job_card_no,
              formatDate(jc.request_date),
              monthYear(jc.request_date),
              jc.requester,
              jc.request_type || "",
              jc.from_store || "",
              jc.to_department || "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              jc.status,
              jc.remarks || "",
            ]
              .map(csvEscape)
              .join(",")
          );
          continue;
        }

        for (const item of items) {
          const req = Number(item.requested_qty);
          const iss = Number(item.issued_qty || 0);
          const remaining = req - iss;

          lines.push(
            [
              jc.job_card_no,
              formatDate(jc.request_date),
              monthYear(jc.request_date),
              jc.requester,
              jc.request_type || "",
              jc.from_store || "",
              jc.to_department || "",
              item.material_code,
              item.description || "",
              item.uom || "",
              req,
              iss,
              remaining,
              item.status,
              jc.status,
              jc.remarks || "",
            ]
              .map(csvEscape)
              .join(",")
          );
        }
      }

      const csv = lines.join("\n");
      const today = new Date().toISOString().split("T")[0];
      const filename = `job_cards_${today}.csv`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate CSV");
    } finally {
      setDownloading(false);
    }
  }

  const visibleData = data.filter(filterByDate);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>

        <Link href="/job-cards/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            + New Job Card
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Job Cards</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
      )}

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
          className="border border-gray-300 px-3 py-2 rounded text-sm"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={downloadCSV}
          disabled={downloading || data.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download CSV"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Job Card No</th>
              <th className="border p-2 text-center">Date</th>
              <th className="border p-2 text-center">Requester</th>
              <th className="border p-2 text-center">Type</th>
              <th className="border p-2 text-center">To</th>
              <th className="border p-2 text-center">Items</th>
              <th className="border p-2 text-center">Progress</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="border p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td colSpan={9} className="border p-4 text-center text-gray-500">
                  {data.length === 0
                    ? 'No job cards yet. Click "+ New Job Card" to create one.'
                    : "No job cards in the selected date range."}
                </td>
              </tr>
            ) : (
              visibleData.map((jc) => (
                <tr key={jc.id}>
                  <td className="border p-2 text-center font-bold">{jc.job_card_no}</td>
                  <td className="border p-2 text-center">{formatDate(jc.request_date)}</td>
                  <td className="border p-2 text-center">{jc.requester}</td>
                  <td className="border p-2 text-center">{jc.request_type || "—"}</td>
                  <td className="border p-2 text-center">{jc.to_department || "—"}</td>
                  <td className="border p-2 text-center">{jc.total_items}</td>
                  <td className="border p-2 text-center font-medium">
                    {Number(jc.total_issued_qty)} / {Number(jc.total_requested_qty)}
                  </td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        STATUS_STYLES[jc.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {jc.status}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <Link href={`/job-cards/${jc.id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}