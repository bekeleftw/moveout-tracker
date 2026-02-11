import { updateUtilityTransfer, createUtilityTransfer, deleteUtilityTransfer, logActivity } from "@/lib/airtable";
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
      for (const r of results) {
        const changed = body.bulk.find((b) => b.recordId === r.id);
        const details = Object.entries(changed?.fields || {}).map(([k, v]) => `${k} → ${v}`).join(", ");
        logActivity({ property_id: r.property_id, utility_id: r.id, action: "field_updated", detail: `${r.utility_type}: ${details}` });
      }
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
    const details = Object.entries(fields).map(([k, v]) => `${k} → ${v}`).join(", ");
    logActivity({ property_id: updated.property_id, utility_id: updated.id, action: "field_updated", detail: `${updated.utility_type}: ${details}` });
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
    logActivity({ property_id, utility_id: created.id, action: "utility_added", detail: `${utility_type} added` });
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

    const propertyId = searchParams.get("propertyId") || "";
    const utilityType = searchParams.get("utilityType") || "";
    const result = await deleteUtilityTransfer(recordId);
    logActivity({ property_id: propertyId, utility_id: recordId, action: "utility_removed", detail: `${utilityType || "Utility"} removed` });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Airtable delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
