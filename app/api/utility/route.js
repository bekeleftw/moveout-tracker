import { updateUtilityTransfer, createUtilityTransfer, deleteUtilityTransfer } from "@/lib/airtable";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const body = await request.json();

    // Bulk update: { bulk: [{ recordId, fields }] }
    if (body.bulk && Array.isArray(body.bulk)) {
      const results = await Promise.all(
        body.bulk.map((item) => updateUtilityTransfer(item.recordId, item.fields))
      );
      return NextResponse.json({ updated: results });
    }

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { property_id, utility_type } = body;

    if (!property_id || !utility_type) {
      return NextResponse.json(
        { error: "Missing property_id or utility_type" },
        { status: 400 }
      );
    }

    const created = await createUtilityTransfer({
      property_id,
      utility_type,
      provider_name: body.provider_name || "",
      provider_phone: body.provider_phone || "",
      provider_website: body.provider_website || "",
    });
    return NextResponse.json(created);
  } catch (err) {
    console.error("Airtable create error:", err);
    return NextResponse.json(
      { error: "Failed to create utility" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        { error: "Missing recordId" },
        { status: 400 }
      );
    }

    const result = await deleteUtilityTransfer(recordId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Airtable delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
