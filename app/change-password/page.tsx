"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: "error", text: "Current password is required" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword === currentPassword) {
      setMessage({ type: "error", text: "New password must be different from current password" });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: "Password changed. Redirecting to login...",
        });
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to change password",
        });
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Network error. Try again." });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <button className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
              Back
            </button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Change Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          You will be logged out after changing your password.
        </p>

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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Current Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
              autoComplete="current-password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              New Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Confirm New Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {submitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}