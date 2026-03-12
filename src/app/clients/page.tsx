"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OAuthClient {
  client_id: string;
  client_name?: string;
  grant_types?: string[];
  scope?: string;
  created_at?: string;
}

interface CreateClientForm {
  client_name: string;
  scope: string;
  audience: string;
}

const DEFAULT_FORM: CreateClientForm = {
  client_name: "",
  scope: "",
  audience: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateClientForm>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<{
    client_id: string;
    client_secret: string;
  } | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch clients");
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreatedSecret(null);
    try {
      const payload: Record<string, unknown> = {
        grant_types: ["client_credentials"],
        token_endpoint_auth_method: "client_secret_post",
        response_types: ["token"],
      };
      if (form.client_name.trim())
        payload.client_name = form.client_name.trim();
      if (form.scope.trim()) payload.scope = form.scope.trim();
      if (form.audience.trim())
        payload.audience = form.audience
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create client");

      setCreatedSecret({
        client_id: data.client_id,
        client_secret: data.client_secret,
      });
      setForm(DEFAULT_FORM);
      await fetchClients();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete client "${id}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete client");
      }
      await fetchClients();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">OAuth Clients</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage OAuth 2.0 clients registered in Ory Hydra.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setCreateError(null);
            setCreatedSecret(null);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Client"}
        </button>
      </div>

      {/* Create client form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Create New Client
          </h3>

          {createdSecret && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">
                ✅ Client created! Save these credentials now — the secret will
                not be shown again.
              </p>
              <p className="text-xs font-mono text-green-700">
                Client ID: <strong>{createdSecret.client_id}</strong>
              </p>
              <p className="text-xs font-mono text-green-700 mt-1">
                Client Secret: <strong>{createdSecret.client_secret}</strong>
              </p>
              <div className="mt-3">
                <Link
                  href={`/tokens/issue?client_id=${encodeURIComponent(createdSecret.client_id)}`}
                  className="inline-block rounded-lg bg-green-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-800 transition-colors"
                >
                  Issue Token with these credentials →
                </Link>
              </div>
            </div>
          )}

          {createError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
                placeholder="e.g. my-service"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scope
              </label>
              <input
                type="text"
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                placeholder="e.g. read write openid"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Space-separated scopes.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audience (optional)
              </label>
              <input
                type="text"
                value={form.audience}
                onChange={(e) =>
                  setForm({ ...form, audience: e.target.value })
                }
                placeholder="e.g. https://api.example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Comma-separated audience URIs.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating…" : "Create Client"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Loading clients…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No clients found. Create one above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Grant Types
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {clients.map((c) => (
                <tr key={c.client_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                    {c.client_id}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {c.client_name ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(c.grant_types ?? []).map((g) => (
                      <span
                        key={g}
                        className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full mr-1"
                      >
                        {g}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs whitespace-nowrap">
                    {c.scope ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c.client_id)}
                      disabled={deletingId === c.client_id}
                      className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingId === c.client_id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
