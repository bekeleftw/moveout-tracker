import { updateUtilityTransfer } from "@/lib/airtable";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { recordId, fields } = body;

    if (!recordId || !fields) {
      return NextResponse.json(
        { error: "Missing recordId or fields" },
        { status: 400 }
      );
    }

    const updated = await updateUtilityTransfer(recordId, fields);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Airtable update error:", err);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
