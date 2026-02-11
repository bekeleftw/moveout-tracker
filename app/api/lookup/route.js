import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.UTILITY_API_URL;
    const apiKey = process.env.UTILITY_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: "Utility lookup API not configured" },
        { status: 500 }
      );
    }

    const url = `${apiUrl}/lookup?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Utility lookup error:", res.status, text);
      return NextResponse.json(
        { error: `Lookup failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Lookup proxy error:", err);
    return NextResponse.json(
      { error: "Failed to look up utilities" },
      { status: 500 }
    );
  }
}
