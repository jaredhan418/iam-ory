import { NextResponse } from "next/server";
import { introspectToken } from "@/lib/hydra";

export async function POST(request: Request) {
  try {
    const { token, scope } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "token is required" },
        { status: 400 }
      );
    }
    const result = await introspectToken(token, scope);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
