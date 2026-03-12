import { NextResponse } from "next/server";
import { listClients, createClient } from "@/lib/hydra";

export async function GET() {
  try {
    const clients = await listClients();
    return NextResponse.json(clients);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
