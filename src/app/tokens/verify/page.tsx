"use client";

import { useState } from "react";

interface TokenIntrospection {
  active: boolean;
  client_id?: string;
  scope?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  aud?: string[];
  iss?: string;
  token_type?: string;
  token_use?: string;
  ext?: Record<string, unknown>;
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export default function VerifyTokenPage() {
  const [token, setToken] = useState("");
  const [scope, setScope] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TokenIntrospection | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/token/introspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          scope: scope.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to introspect token");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Verify / Introspect Token
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Introspect an access token against Ory Hydra to verify its validity
          and inspect its claims.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Token Input
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your access token here…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Scope (optional)
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. read write"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                If provided, Hydra will only return active=true when the token
                has at least these scopes.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Introspecting…" : "Introspect Token"}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Introspection Result
          </h3>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Paste a token and click &quot;Introspect Token&quot;.
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Status badge */}
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  result.active
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <span className="text-xl">{result.active ? "✅" : "❌"}</span>
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      result.active ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {result.active ? "Token is ACTIVE" : "Token is INACTIVE"}
                  </p>
                  {!result.active && (
                    <p className="text-xs text-red-600 mt-0.5">
                      The token may be expired, revoked, or invalid.
                    </p>
                  )}
                </div>
              </div>

              {/* Claims table */}
              {result.active && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {result.client_id && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500 w-1/3">
                            Client ID
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                            {result.client_id}
                          </td>
                        </tr>
                      )}
                      {result.sub && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Subject
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                            {result.sub}
                          </td>
                        </tr>
                      )}
                      {result.scope && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Scope
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">
                            {result.scope}
                          </td>
                        </tr>
                      )}
                      {result.iss && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Issuer
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-700 break-all">
                            {result.iss}
                          </td>
                        </tr>
                      )}
                      {result.aud && result.aud.length > 0 && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Audience
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">
                            {result.aud.join(", ")}
                          </td>
                        </tr>
                      )}
                      {result.token_type && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Token Type
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">
                            {result.token_type}
                          </td>
                        </tr>
                      )}
                      {result.iat != null && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Issued At
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs">
                            {formatTimestamp(result.iat)}
                          </td>
                        </tr>
                      )}
                      {result.exp != null && (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-500">
                            Expires At
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs">
                            {formatTimestamp(result.exp)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Raw JSON */}
              <details className="rounded-lg border border-gray-200 overflow-hidden">
                <summary className="px-4 py-2.5 text-xs font-medium text-gray-500 cursor-pointer bg-gray-50 hover:bg-gray-100">
                  Raw JSON
                </summary>
                <pre className="px-4 py-3 text-xs font-mono text-gray-700 overflow-auto max-h-64 bg-white">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
