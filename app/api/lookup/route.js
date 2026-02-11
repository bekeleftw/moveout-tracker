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

    const apiUrl = (process.env.UTILITY_API_URL || "").replace(/\/+$/, "");
    const apiKey = process.env.UTILITY_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error("Utility lookup not configured:", { hasUrl: !!apiUrl, hasKey: !!apiKey });
      return NextResponse.json(
        { error: "Utility lookup API not configured" },
        { status: 500 }
      );
    }

    const url = `${apiUrl}/lookup?address=${encodeURIComponent(address)}`;
    console.log("Utility lookup request:", url);
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Utility lookup error:", res.status, text, "URL:", url);
      return NextResponse.json(
        { error: `Lookup failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Utility lookup response:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch (err) {
    console.error("Lookup proxy error:", err);
    return NextResponse.json(
      { error: "Failed to look up utilities" },
      { status: 500 }
    );
  }
}
