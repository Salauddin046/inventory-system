"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface JobCardSummary {
  id: number;
  job_card_no: string;
  requester: string;
  request_date: string;
  status: string;
  total_items: string | number;
  total_requested_qty: string | number;
  total_issued_qty: string | number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  Partial: "bg-yellow-100 text-yellow-800",
  Closed: "bg-green-100 text-green-800",
};

export default function JobCardListPage() {
  const [data, setData] = useState<JobCardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  function formatDate(s: string) {
    if (!s) return "";
    try {
      return new Date(s).toLocaleDateString("en-GB");
    } catch {
      return s;
    }
  }

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

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Job Card No</th>
              <th className="border p-2 text-center">Requester</th>
              <th className="border p-2 text-center">Date</th>
              <th className="border p-2 text-center">Items</th>
              <th className="border p-2 text-center">Progress</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="border p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="border p-4 text-center text-gray-500">
                  No job cards yet. Click "+ New Job Card" to create one.
                </td>
              </tr>
            ) : (
              data.map((jc) => (
                <tr key={jc.id}>
                  <td className="border p-2 text-center font-bold">
                    {jc.job_card_no}
                  </td>
                  <td className="border p-2 text-center">{jc.requester}</td>
                  <td className="border p-2 text-center">
                    {formatDate(jc.request_date)}
                  </td>
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