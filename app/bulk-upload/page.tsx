"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = "materials" | "req-persons" | "vendor-depts";

interface UploadResult {
  inserted: number;
  skipped: number;
  errors: string[];
  total: number;
}

const TAB_CONFIG: Record<Tab, {
  label: string;
  endpoint: string;
  csvColumns: string[];
  sampleRows: string[][];
  filename: string;
  description: string;
}> = {
  materials: {
    label: "Materials",
    endpoint: "/api/bulk-upload/materials",
    csvColumns: ["material_code", "description", "type_of_material", "uom"],
    sampleRows: [
      ["AH019", "harness 22 wire", "AH", "Nos"],
      ["AH020", "harness 24 wire", "AH", "Nos"],
      ["PH001", "phone cable", "PH", "Nos"],
    ],
    filename: "sample_materials.csv",
    description: "Upload material master data. Required: material_code, uom. Optional: description, type_of_material.",
  },
  "req-persons": {
    label: "Requesting Persons",
    endpoint: "/api/bulk-upload/req-persons",
    csvColumns: ["req_person"],
    sampleRows: [
      ["Salauddin"],
      ["Pruthvi"],
      ["Rakesh"],
    ],
    filename: "sample_req_persons.csv",
    description: "Upload names of people who can request materials.",
  },
  "vendor-depts": {
    label: "Vendors / Departments",
    endpoint: "/api/bulk-upload/vendor-depts",
    csvColumns: ["vendor_dept"],
    sampleRows: [
      ["Vendor A"],
      ["Vendor B"],
      ["Maintenance"],
    ],
    filename: "sample_vendor_depts.csv",
    description: "Upload vendor or department names for the Outward form dropdown.",
  },
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseLineRespectingQuotes(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });
    return row;
  });
}

function parseLineRespectingQuotes(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function csvEscape(value: string): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildSampleCSV(columns: string[], rows: string[][]): string {
  const headerLine = columns.map(csvEscape).join(",");
  const rowLines = rows.map((row) => row.map(csvEscape).join(","));
  return [headerLine, ...rowLines].join("\n");
}

function downloadSampleCSV(filename: string, columns: string[], rows: string[][]) {
  const csv = buildSampleCSV(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState<Tab>("materials");
  const [csvText, setCsvText] = useState("");
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = TAB_CONFIG[activeTab];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setResult(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);

      try {
        const data = parseCSV(text);
        setParsedData(data);
        if (data.length === 0) {
          setError("CSV is empty or could not be parsed");
        }
      } catch (err) {
        setError("Failed to parse CSV. Check format.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setCsvText("");
    setParsedData([]);
    setResult(null);
    setError(null);
  }

  function handleSampleDownload() {
    downloadSampleCSV(config.filename, config.csvColumns, config.sampleRows);
  }

  async function handleUpload() {
    if (parsedData.length === 0) {
      setError("Nothing to upload. Choose a CSV file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setResult({
          inserted: data.inserted || 0,
          skipped: data.skipped || 0,
          errors: data.errors || [],
          total: data.total || parsedData.length,
        });
        setCsvText("");
        setParsedData([]);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error during upload");
    } finally {
      setUploading(false);
    }
  }

  const previewRows = parsedData.slice(0, 5);
  const headers = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Bulk Upload</h1>

      <div className="flex gap-2 mb-6 border-b">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            {TAB_CONFIG[tab].label}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">{config.label}</h2>
        <p className="text-sm text-gray-700 mb-2">{config.description}</p>
        <p className="text-sm text-gray-700 mb-1">
          <strong>CSV columns (header row required):</strong> {config.csvColumns.join(", ")}
        </p>
        <button
          type="button"
          onClick={handleSampleDownload}
          className="mt-2 bg-green-600 text-white px-4 py-1 rounded text-sm"
        >
          Download Sample CSV
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Choose CSV File
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={uploading}
          className="border p-2 rounded"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
      )}

      {parsedData.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">
            Preview ({parsedData.length} row{parsedData.length === 1 ? "" : "s"})
          </h3>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="border p-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td key={h} className="border p-2">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 5 && (
            <p className="text-xs text-gray-500 mt-1">
              Showing first 5 of {parsedData.length} rows
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || parsedData.length === 0}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : `Upload ${parsedData.length} row(s)`}
      </button>

      {result && (
        <div className="mt-6 p-4 rounded bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Upload Complete</h3>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Total in CSV:</strong> {result.total}
            </li>
            <li className="text-green-700">
              <strong>Inserted:</strong> {result.inserted}
            </li>
            <li className="text-orange-700">
              <strong>Skipped (duplicates):</strong> {result.skipped}
            </li>
            {result.errors.length > 0 && (
              <li className="text-red-700">
                <strong>Errors:</strong> {result.errors.length}
                <ul className="ml-4 mt-1 list-disc">
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...and {result.errors.length - 10} more</li>
                  )}
                </ul>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}