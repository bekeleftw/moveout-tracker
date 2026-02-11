import Airtable from "airtable";

let _base = null;

export function getBase() {
  if (!_base) {
    _base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );
  }
  return _base;
}

export async function getCompanyBySlug(slug) {
  const records = await getBase()("tbltEkgtKDSuxmDBb")
    .select({
      filterByFormula: `{slug} = "${slug}"`,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;

  const company = records[0];
  return {
    id: company.id,
    slug: company.fields.slug,
    company_name: company.fields.company_name,
    logo_url: company.fields.logo_url || "",
    brand_color: company.fields.brand_color || "#1B3E6F",
  };
}

export async function getPropertiesForCompany(slug) {
  const records = await getBase()("tbl4SHxj7F31DhCzo")
    .select({
      filterByFormula: `{company_slug} = "${slug}"`,
    })
    .firstPage();

  return records.map((r) => ({
    id: r.id,
    property_id: r.fields.property_id || "",
    address: r.fields.address || "",
    city: r.fields.city || "",
    state: r.fields.state || "",
    zip: r.fields.zip || "",
    vacant_since: r.fields.vacant_since || "",
    tenant_move_out: r.fields.tenant_move_out || "",
  }));
}

export async function getUtilityTransfersForProperties(propertyIds) {
  if (!propertyIds || propertyIds.length === 0) return [];

  const conditions = propertyIds.map((id) => `{property_id} = "${id}"`).join(",");
  const formula = propertyIds.length === 1 ? conditions : `OR(${conditions})`;

  const records = await getBase()("tblTNmLdE7pRbXuRN")
    .select({
      filterByFormula: formula,
    })
    .firstPage();

  return records.map((r) => ({
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

export async function updateUtilityTransfer(recordId, fields) {
  const allowed = ["transfer_to", "target_date", "status", "notes", "provider_name", "provider_phone", "provider_website"];
  const clean = {};
  for (const key of allowed) {
    if (key in fields) {
      clean[key] = fields[key];
    }
  }

  const record = await getBase()("tblTNmLdE7pRbXuRN").update(recordId, clean);
  return {
    id: record.id,
    property_id: record.fields.property_id || "",
    utility_type: record.fields.utility_type || "",
    provider_name: record.fields.provider_name || "",
    provider_phone: record.fields.provider_phone || "",
    provider_website: record.fields.provider_website || "",
    transfer_to: record.fields.transfer_to || "",
    target_date: record.fields.target_date || "",
    status: record.fields.status || "Not Started",
    notes: record.fields.notes || "",
  };
}

export async function createUtilityTransfer(fields) {
  const allowed = ["property_id", "utility_type", "provider_name", "provider_phone", "provider_website", "transfer_to", "target_date", "status", "notes"];
  const clean = {};
  for (const key of allowed) {
    if (key in fields) {
      clean[key] = fields[key];
    }
  }
  if (!clean.status) clean.status = "Not Started";

  const record = await getBase()("tblTNmLdE7pRbXuRN").create(clean);
  return {
    id: record.id,
    property_id: record.fields.property_id || "",
    utility_type: record.fields.utility_type || "",
    provider_name: record.fields.provider_name || "",
    provider_phone: record.fields.provider_phone || "",
    provider_website: record.fields.provider_website || "",
    transfer_to: record.fields.transfer_to || "",
    target_date: record.fields.target_date || "",
    status: record.fields.status || "Not Started",
    notes: record.fields.notes || "",
  };
}

export async function deleteUtilityTransfer(recordId) {
  await getBase()("tblTNmLdE7pRbXuRN").destroy(recordId);
  return { id: recordId };
}

export async function deleteProperty(recordId, propertyId) {
  // Delete associated utility transfers first
  if (propertyId) {
    const transfers = await getBase()("tblTNmLdE7pRbXuRN")
      .select({ filterByFormula: `{property_id} = "${propertyId}"` })
      .firstPage();
    if (transfers.length > 0) {
      const ids = transfers.map((r) => r.id);
      // Airtable destroy accepts up to 10 at a time
      for (let i = 0; i < ids.length; i += 10) {
        await getBase()("tblTNmLdE7pRbXuRN").destroy(ids.slice(i, i + 10));
      }
    }
  }
  // Delete the property record
  await getBase()("tbl4SHxj7F31DhCzo").destroy(recordId);
  return { id: recordId };
}

const ACTIVITY_TABLE = "tbltOTyDcZStOyz5k";

export async function logActivity({ property_id, utility_id, action, detail }) {
  try {
    await getBase()(ACTIVITY_TABLE).create({
      property_id: property_id || "",
      utility_id: utility_id || "",
      action: action || "",
      detail: detail || "",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Activity log error:", err);
  }
}

export async function getActivityForProperties(propertyIds) {
  if (!propertyIds || propertyIds.length === 0) return [];

  const conditions = propertyIds.map((id) => `{property_id} = "${id}"`).join(",");
  const formula = propertyIds.length === 1 ? conditions : `OR(${conditions})`;

  const records = await getBase()(ACTIVITY_TABLE)
    .select({
      filterByFormula: formula,
      sort: [{ field: "timestamp", direction: "desc" }],
    })
    .firstPage();

  return records.map((r) => ({
    id: r.id,
    property_id: r.fields.property_id || "",
    utility_id: r.fields.utility_id || "",
    action: r.fields.action || "",
    detail: r.fields.detail || "",
    timestamp: r.fields.timestamp || "",
  }));
}

export async function getFullCompanyData(slug) {
  const company = await getCompanyBySlug(slug);
  if (!company) return null;

  const properties = await getPropertiesForCompany(slug);

  const propertyIds = properties.map((p) => p.property_id).filter(Boolean);
  const [allTransfers, allActivity] = await Promise.all([
    getUtilityTransfersForProperties(propertyIds),
    getActivityForProperties(propertyIds),
  ]);

  const transfersByProperty = {};
  for (const t of allTransfers) {
    if (!transfersByProperty[t.property_id]) {
      transfersByProperty[t.property_id] = [];
    }
    transfersByProperty[t.property_id].push(t);
  }

  const activityByProperty = {};
  for (const a of allActivity) {
    if (!activityByProperty[a.property_id]) {
      activityByProperty[a.property_id] = [];
    }
    activityByProperty[a.property_id].push(a);
  }

  const propertiesWithUtilities = properties.map((p) => ({
    ...p,
    utilities: transfersByProperty[p.property_id] || [],
    activity: activityByProperty[p.property_id] || [],
  }));

  return {
    company: {
      id: company.id,
      slug: company.slug,
      company_name: company.company_name,
      logo_url: company.logo_url,
      brand_color: company.brand_color,
    },
    properties: propertiesWithUtilities,
  };
}
