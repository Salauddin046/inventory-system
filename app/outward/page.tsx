"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Material {
  id: number;
  material_code: string;
  description: string;
  uom?: string;
}

interface ReqPerson {
  id: number;
  req_person: string;
}

interface VendorDept {
  id: number;
  vendor_dept: string;
}

interface OutwardRow {
  id: number;
  req_date: string;
  month: string;
  req_person: string;
  to_vendor_dept: string;
  job_card_po_no: string;
  material_code: string;
  material_description: string;
  type_of_material: string;
  req_qty: number;
  g_outward_qty: number;
  ng_outward_qty: number;
  uom: string;
  issuance_date: string;
  tally_ref_no: string;
  remarks: string;
  outward_type: string | null;
}

const OUTWARD_TYPES = ["Projection", "Adhoc", "Conversion", "Demo", "POC"];

function formatDate(dateString: string) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-GB");
  } catch {
    return "";
  }
}

function OutwardPageInner() {
  const searchParams = useSearchParams();

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const formattedDate = today.toISOString().split("T")[0];
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const [outwardData, setOutwardData] = useState<OutwardRow[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [reqPersons, setReqPersons] = useState<ReqPerson[]>([]);
  const [vendorDepts, setVendorDepts] = useState<VendorDept[]>([]);

  const [dateFilter, setDateFilter] = useState({
    from_date: "",
    to_date: "",
  });

  const [form, setForm] = useState({
    req_date: formattedDate,
    month: currentMonth + " " + currentYear,
    req_person: "",
    to_vendor_dept: "",
    job_card_po_no: "",
    material_code: "",
    description: "",
    req_qty: "",
    g_outward_qty: "",
    ng_outward_qty: "",
    uom: "",
    issuance_date: formattedDate,
    tally_ref_no: "",
    remarks: "",
    outward_type: "",
    job_card_id: "",
    job_card_item_id: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  const fetchAllData = useCallback(async () => {
    try {
      const [outwardRes, materialRes, reqRes, vendorRes] = await Promise.all([
        fetch("/api/outward", { cache: "no-store" }),
        fetch("/api/materials"),
        fetch("/api/req-person"),
        fetch("/api/vendor-dept"),
      ]);

      if (outwardRes.ok) {
        const json = await outwardRes.json();
        if (Array.isArray(json)) setOutwardData(json);
      }

      if (materialRes.ok) {
        const json = await materialRes.json();
        if (Array.isArray(json)) setMaterials(json);
      }

      if (reqRes.ok) {
        const json = await reqRes.json();
        if (Array.isArray(json)) setReqPersons(json);
      }

      if (vendorRes.ok) {
        const json = await vendorRes.json();
        if (Array.isArray(json)) setVendorDepts(json);
      }
    } catch (error) {
      console.error("Outward fetch failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Pre-fill from query params (when user comes from job card Issue button)
  useEffect(() => {
    if (materials.length === 0) return;

    const matCode = searchParams.get("material_code");
    if (!matCode) return;

    const material = materials.find((m) => m.material_code === matCode);

    setForm((prev) => ({
      ...prev,
      material_code: matCode,
      description: material?.description || searchParams.get("description") || "",
      uom: material?.uom || "Nos",
      req_qty: searchParams.get("qty") || "",
      g_outward_qty: searchParams.get("qty") || "",
      job_card_po_no: searchParams.get("job_card_no") || prev.job_card_po_no,
      tally_ref_no: searchParams.get("job_card_no") || prev.tally_ref_no,
      outward_type: searchParams.get("outward_type") || prev.outward_type,
      job_card_id: searchParams.get("job_card_id") || "",
      job_card_item_id: searchParams.get("job_card_item_id") || "",
    }));
  }, [materials, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/outward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          req_date: form.req_date,
          month: form.month,
          req_person: form.req_person,
          to_vendor_dept: form.to_vendor_dept,
          job_card_po_no: form.job_card_po_no,
          material_code: form.material_code,
          material_description: form.description,
          type_of_material: "",
          req_qty: Number(form.req_qty || 0),
          g_outward_qty: Number(form.g_outward_qty || 0),
          ng_outward_qty: Number(form.ng_outward_qty || 0),
          uom: form.uom,
          issuance_date: form.issuance_date,
          tally_ref_no: form.tally_ref_no,
          remarks: form.remarks,
          outward_type: form.outward_type || null,
          job_card_id: form.job_card_id ? Number(form.job_card_id) : null,
          job_card_item_id: form.job_card_item_id ? Number(form.job_card_item_id) : null,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showMessage("success", "Outward Saved Successfully");
        // Reset form to initial state
        setForm({
          req_date: formattedDate,
          month: currentMonth + " " + currentYear,
          req_person: "",
          to_vendor_dept: "",
          job_card_po_no: "",
          material_code: "",
          description: "",
          req_qty: "",
          g_outward_qty: "",
          ng_outward_qty: "",
          uom: "",
          issuance_date: formattedDate,
          tally_ref_no: "",
          remarks: "",
          outward_type: "",
          job_card_id: "",
          job_card_item_id: "",
        });
        await fetchAllData();
      } else {
        showMessage("error", result.error || "Save Failed");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleMaterialChange(code: string) {
    const selected = materials.find((m) => m.material_code === code);
    if (selected) {
      setForm({
        ...form,
        material_code: selected.material_code,
        description: selected.description || "",
        uom: selected.uom || "Nos",
      });
    } else {
      setForm({
        ...form,
        material_code: "",
        description: "",
        uom: "",
      });
    }
  }

  function downloadCSV() {
    const filteredRows = outwardData.filter((item) => {
      if (!dateFilter.from_date || !dateFilter.to_date) return true;
      const issuanceDate = new Date(item.issuance_date);
      const fromDate = new Date(dateFilter.from_date);
      const toDate = new Date(dateFilter.to_date + "T23:59:59");
      return issuanceDate >= fromDate && issuanceDate <= toDate;
    });

    const headers = [
      "Req Date",
      "Month",
      "Req Person",
      "Vendor / Dept",
      "Job Card",
      "Material Code",
      "Description",
      "Outward Type",
      "Req Qty",
      "G Qty",
      "NG Qty",
      "UOM",
      "Issuance Date",
      "Tally Ref",
      "Remarks",
    ];

    const rows = filteredRows.map((item) => [
      formatDate(item.req_date),
      item.month,
      item.req_person,
      item.to_vendor_dept,
      item.job_card_po_no,
      item.material_code,
      item.material_description,
      item.outward_type || "",
      item.req_qty,
      item.g_outward_qty,
      item.ng_outward_qty,
      item.uom,
      formatDate(item.issuance_date),
      item.tally_ref_no,
      item.remarks,
    ]);

    const csvEscape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const today = new Date().toISOString().split("T")[0];
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `outward_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const fromJobCard = Boolean(form.job_card_id);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Outward Entry</h1>

      {fromJobCard && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-800 border border-blue-200">
          <strong>Linked to job card:</strong> {form.tally_ref_no || form.job_card_po_no}.
          Material and quantity pre-filled. Saving this outward will mark the job card item as issued.
        </div>
      )}

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 mb-8">
        <input
          type="date"
          value={form.req_date}
          onChange={(e) => setForm({ ...form, req_date: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <input
          type="text"
          value={form.month}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <select
          value={form.req_person}
          onChange={(e) => setForm({ ...form, req_person: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        >
          <option value="">Select Req Person</option>
          {reqPersons.map((item) => (
            <option key={item.id} value={item.req_person}>
              {item.req_person}
            </option>
          ))}
        </select>

        <select
          value={form.to_vendor_dept}
          onChange={(e) => setForm({ ...form, to_vendor_dept: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        >
          <option value="">Select Vendor / Dept</option>
          {vendorDepts.map((item) => (
            <option key={item.id} value={item.vendor_dept}>
              {item.vendor_dept}
            </option>
          ))}
        </select>

        <select
          value={form.outward_type}
          onChange={(e) => setForm({ ...form, outward_type: e.target.value })}
          disabled={submitting || fromJobCard}
          className={`border p-2 rounded ${fromJobCard ? "bg-gray-100" : ""}`}
        >
          <option value="">Select Outward Type</option>
          {OUTWARD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Job Card / PO No"
          value={form.job_card_po_no}
          onChange={(e) => setForm({ ...form, job_card_po_no: e.target.value })}
          disabled={submitting || fromJobCard}
          className={`border p-2 rounded ${fromJobCard ? "bg-gray-100" : ""}`}
        />

        <select
          value={form.material_code}
          onChange={(e) => handleMaterialChange(e.target.value)}
          disabled={submitting || fromJobCard}
          className={`border p-2 rounded ${fromJobCard ? "bg-gray-100" : ""}`}
        >
          <option value="">Select Material</option>
          {materials.map((item) => (
            <option key={item.id} value={item.material_code}>
              {item.material_code}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={form.description}
          readOnly
          placeholder="Description"
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="number"
          placeholder="Req Qty"
          value={form.req_qty}
          onChange={(e) => setForm({ ...form, req_qty: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="G Outward Qty"
          value={form.g_outward_qty}
          onChange={(e) => setForm({ ...form, g_outward_qty: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="NG Outward Qty"
          value={form.ng_outward_qty}
          onChange={(e) => setForm({ ...form, ng_outward_qty: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <input
          type="text"
          value={form.uom}
          readOnly
          placeholder="UOM"
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="date"
          value={form.issuance_date}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <input
          type="text"
          placeholder="Tally Ref No"
          value={form.tally_ref_no}
          onChange={(e) => setForm({ ...form, tally_ref_no: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          disabled={submitting}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Outward"}
        </button>
      </form>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={dateFilter.from_date}
          onChange={(e) => setDateFilter({ ...dateFilter, from_date: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={dateFilter.to_date}
          onChange={(e) => setDateFilter({ ...dateFilter, to_date: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          type="button"
          onClick={downloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Req Date</th>
              <th className="border p-2">Month</th>
              <th className="border p-2">Req Person</th>
              <th className="border p-2">Vendor / Dept</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Job Card</th>
              <th className="border p-2">Material Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Req Qty</th>
              <th className="border p-2">G Qty</th>
              <th className="border p-2">NG Qty</th>
              <th className="border p-2">UOM</th>
              <th className="border p-2">Issuance Date</th>
              <th className="border p-2">Tally Ref</th>
              <th className="border p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {outwardData && outwardData.length > 0 ? (
              outwardData.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{formatDate(item.req_date)}</td>
                  <td className="border p-2">{item.month}</td>
                  <td className="border p-2">{item.req_person}</td>
                  <td className="border p-2">{item.to_vendor_dept}</td>
                  <td className="border p-2">{item.outward_type || "—"}</td>
                  <td className="border p-2">{item.job_card_po_no}</td>
                  <td className="border p-2">{item.material_code}</td>
                  <td className="border p-2">{item.material_description}</td>
                  <td className="border p-2">{item.req_qty}</td>
                  <td className="border p-2">{item.g_outward_qty}</td>
                  <td className="border p-2">{item.ng_outward_qty}</td>
                  <td className="border p-2">{item.uom}</td>
                  <td className="border p-2">{formatDate(item.issuance_date)}</td>
                  <td className="border p-2">{item.tally_ref_no}</td>
                  <td className="border p-2">{item.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={15} className="border p-4 text-center">
                  No Outward Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OutwardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <OutwardPageInner />
    </Suspense>
  );
}