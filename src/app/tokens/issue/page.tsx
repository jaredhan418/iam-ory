"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

function IssueTokenForm() {
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [scope, setScope] = useState("");
  const [audience, setAudience] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TokenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill client_id from ?client_id= query param (set by the Clients page)
  useEffect(() => {
    const id = searchParams.get("client_id");
    if (id) setClientId(id);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/token/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          scope: scope.trim() || undefined,
          audience: audience.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = data.error ?? "Failed to issue token";
        if (res.status === 401) {
          msg =
            "invalid_client: the client_secret does not match. " +
            "Make sure you are using the secret shown at creation time. " +
            "If you changed SECRETS_SYSTEM and restarted Hydra, existing " +
            "clients are no longer valid — recreate them on the Clients page.";
        }
        throw new Error(msg);
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    if (!result) return;
    await navigator.clipboard.writeText(result.access_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Client Credentials
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="your-client-id"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="your-client-secret"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scope (optional)
              </label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. read write"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Space-separated list of scopes to request.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audience (optional)
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. https://api.example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Requesting token…" : "Request Access Token"}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Token Response
          </h3>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Fill in the form and click &quot;Request Access Token&quot;.
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Access Token
                  </span>
                  <button
                    onClick={copyToken}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                  {result.access_token}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Token Type</p>
                  <p className="font-medium text-gray-800">
                    {result.token_type}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Expires In</p>
                  <p className="font-medium text-gray-800">
                    {result.expires_in}s
                  </p>
                </div>
                {result.scope && (
                  <div className="col-span-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Scope</p>
                    <p className="font-medium text-gray-800">{result.scope}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Use this token in the{" "}
                <code className="font-mono bg-gray-100 px-1 rounded">
                  Authorization: Bearer &lt;token&gt;
                </code>{" "}
                header or paste it into the{" "}
                <a
                  href="/tokens/verify"
                  className="text-indigo-600 hover:underline"
                >
                  Verify Token
                </a>{" "}
                page.
              </p>
            </div>
          )}
        </div>
    </div>
  );
}

export default function IssueTokenPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Issue M2M Token</h2>
        <p className="mt-1 text-sm text-gray-500">
          Obtain an OAuth 2.0 access token using the{" "}
          <code className="font-mono bg-gray-100 px-1 rounded">
            client_credentials
          </code>{" "}
          grant. The credentials are sent securely from the server to Ory
          Hydra&apos;s token endpoint.
        </p>
      </div>
      <Suspense fallback={null}>
        <IssueTokenForm />
      </Suspense>
    </div>
  );
}
