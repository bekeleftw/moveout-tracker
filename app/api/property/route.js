import { NextResponse } from "next/server";
import { getBase, deleteProperty } from "@/lib/airtable";

export const dynamic = "force-dynamic";

const PROPERTIES_TABLE = "tbl4SHxj7F31DhCzo";
const TRANSFERS_TABLE = "tblTNmLdE7pRbXuRN";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_slug,
      property_id,
      address,
      city,
      state,
      zip,
      tenant_move_out,
      utilities,
    } = body;

    if (!company_slug || !address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a property_id if not provided
    const pid =
      property_id ||
      `${company_slug}-${address.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-${Date.now()}`;

    // Create the property record
    const propRecord = await getBase()(PROPERTIES_TABLE).create({
      company_slug,
      property_id: pid,
      address,
      city,
      state,
      zip: zip || "",
      tenant_move_out: tenant_move_out || null,
    });

    // Create utility transfer records if provided
    let createdUtilities = [];
    if (utilities && utilities.length > 0) {
      const utilRecords = await getBase()(TRANSFERS_TABLE).create(
        utilities.map((u) => ({
          fields: {
            property_id: pid,
            utility_type: u.utility_type,
            provider_name: u.provider_name || "",
            provider_phone: u.provider_phone || "",
            provider_website: u.provider_website || "",
            status: "Not Started",
          },
        }))
      );

      createdUtilities = utilRecords.map((r) => ({
        id: r.id,
        property_id: r.fields.property_id || "",
        utility_type: r.fields.utility_type || "",
        provider_name: r.fields.provider_name || "",
        provider_phone: r.fields.provider_phone || "",
        provider_website: r.fields.provider_website || "",
        transfer_to: r.fields.transfer_to || "",
        target_date: r.fields.target_date || "",
        status: r.fields.status || "Not Started",
        notes: r.fields.notes || "",
      }));
    }

    return NextResponse.json({
      property: {
        id: propRecord.id,
        property_id: pid,
        address,
        city,
        state,
        zip: zip || "",
        vacant_since: "",
        tenant_move_out: tenant_move_out || "",
        utilities: createdUtilities,
      },
    });
  } catch (err) {
    console.error("Create property error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");
    const propertyId = searchParams.get("propertyId");

    if (!recordId) {
      return NextResponse.json(
        { error: "Missing recordId" },
        { status: 400 }
      );
    }

    const result = await deleteProperty(recordId, propertyId || "");
    return NextResponse.json(result);
  } catch (err) {
    console.error("Delete property error:", err);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
