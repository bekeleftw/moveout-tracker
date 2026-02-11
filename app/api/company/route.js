import { getFullCompanyData } from "@/lib/airtable";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const data = await getFullCompanyData(slug);
    if (!data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Airtable error:", err);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
