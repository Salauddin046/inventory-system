"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface StockRow {
  material_code: string;
  description: string;
  good_inward: number;
  ng_inward: number;
  good_outward: number;
  ng_outward: number;
  projection_qty: number;
  live_stock: number;
  is_over_allocated?: boolean;
  ng_stock?: number;
}

const COLUMNS = [
  "Material Code", "Description", "Good Inward", "NG Inward",
  "Good Outward", "NG Outward", "Projection Qty", "Live Stock",
];

export default function LiveStockPage() {
  const [stockData, setStockData] = useState<StockRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveStock();
  }, []);

  async function fetchLiveStock() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/live-stock", { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || `Failed to load (status ${response.status})`);
        return;
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setStockData(result);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading stock data");
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stockData;
    return stockData.filter(item =>
      item.material_code?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  }, [stockData, search]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>

        <input
          type="text"
          placeholder="Search Material"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-80"
        />
      </div>

      <h1 className="text-4xl font-bold mb-6">Live Stock</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              {COLUMNS.map(col => (
                <th key={col} className="border p-3 text-center">{col}</th>
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
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="border p-4 text-center">
                  {search ? "No matches found" : "No Stock Data Found"}
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr
                  key={item.material_code}
                  className={item.is_over_allocated ? "bg-red-50" : ""}
                >
                  <td className="border p-3 text-center font-bold">
                    {item.material_code}
                  </td>
                  <td className="border p-3 text-center">
                    {item.description}
                  </td>
                  <td className="border p-3 text-center text-green-600 font-bold">
                    {item.good_inward ?? 0}
                  </td>
                  <td className="border p-3 text-center text-red-600 font-bold">
                    {item.ng_inward ?? 0}
                  </td>
                  <td className="border p-3 text-center text-blue-600 font-bold">
                    {item.good_outward ?? 0}
                  </td>
                  <td className="border p-3 text-center text-orange-600 font-bold">
                    {item.ng_outward ?? 0}
                  </td>
                  <td className="border p-3 text-center text-yellow-600 font-bold">
                    {item.projection_qty ?? 0}
                  </td>
                  <td className="border p-3 text-center text-purple-600 font-bold">
                    {item.live_stock ?? 0}
                    {item.is_over_allocated && (
                      <span
                        className="ml-2 text-xs text-red-700"
                        title="Allocations exceed available stock"
                      >
                        ⚠
                      </span>
                    )}
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