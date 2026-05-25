"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  disabled: "bg-red-100 text-red-800",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });

      if (response.status === 403) {
        setError("Access denied. Only the admin can view this page.");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error || `Failed to load (${response.status})`);
        return;
      }

      const result = await response.json();
      if (Array.isArray(result)) {
        setUsers(result);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading users");
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

  async function updateStatus(userId: number, newStatus: string, label: string) {
    if (!confirm(`Are you sure you want to ${label} this user?`)) return;

    setUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showMessage("success", `User ${label}d successfully`);
        await fetchData();
      } else {
        showMessage("error", result.error || `Failed to ${label}`);
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Network error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded mb-4">Back</button>
        </Link>
        <div className="p-3 rounded bg-red-100 text-red-800">{error}</div>
      </div>
    );
  }

  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p className="text-sm text-gray-600 mb-6">
        Approve pending registrations, disable existing users, or re-enable disabled users.
        {pendingCount > 0 && (
          <span className="ml-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
            {pendingCount} pending approval
          </span>
        )}
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">ID</th>
              <th className="border p-2 text-center">Name</th>
              <th className="border p-2 text-center">Email</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Registered</th>
              <th className="border p-2 text-center w-64">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="border p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isAdmin = u.id === 1;
                const isUpdating = updatingId === u.id;

                return (
                  <tr key={u.id}>
                    <td className="border p-2 text-center">{u.id}</td>
                    <td className="border p-2 text-center">
                      {u.name} {isAdmin && <span className="text-xs text-gray-500">(admin)</span>}
                    </td>
                    <td className="border p-2 text-center">{u.email}</td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          STATUS_STYLES[u.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="border p-2 text-center">{formatDate(u.created_at)}</td>
                    <td className="border p-2 text-center">
                      {isAdmin ? (
                        <span className="text-xs text-gray-500">Protected</span>
                      ) : (
                        <div className="flex justify-center gap-2 flex-wrap">
                          {u.status === "pending" && (
                            <button
                              onClick={() => updateStatus(u.id, "active", "approve")}
                              disabled={isUpdating}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isUpdating ? "..." : "Approve"}
                            </button>
                          )}
                          {u.status === "active" && (
                            <button
                              onClick={() => updateStatus(u.id, "disabled", "disable")}
                              disabled={isUpdating}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isUpdating ? "..." : "Disable"}
                            </button>
                          )}
                          {u.status === "disabled" && (
                            <button
                              onClick={() => updateStatus(u.id, "active", "re-enable")}
                              disabled={isUpdating}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isUpdating ? "..." : "Re-enable"}
                            </button>
                          )}
                          {u.status === "pending" && (
                            <button
                              onClick={() => updateStatus(u.id, "disabled", "reject")}
                              disabled={isUpdating}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isUpdating ? "..." : "Reject"}
                            </button>
                          )}
                        </div>
                      )}
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