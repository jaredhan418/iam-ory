import { NextResponse } from "next/server";

/**
 * Issue an M2M token using the OAuth 2.0 client credentials grant.
 *
 * This route proxies the request to Ory Hydra's public token endpoint so that
 * the client_secret never leaves the server.
 */
export async function POST(request: Request) {
  try {
    const { client_id, client_secret, scope, audience } =
      await request.json();

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: "client_id and client_secret are required" },
        { status: 400 }
      );
    }

    const hydraPublicUrl =
      process.env.HYDRA_PUBLIC_URL ?? "http://localhost:4444";

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id,
      client_secret,
    });

    if (scope) body.set("scope", scope);
    if (audience) body.set("audience", audience);

    const res = await fetch(`${hydraPublicUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data.error_description ?? data.error ?? res.statusText;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
