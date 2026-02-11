"use client";

import { useState, useEffect, useCallback } from "react";

// --- Status & Utility Config ---
const STATUS_CONFIG = {
  "Not Started": { label: "Not Started", bg: "#fef3f2", color: "#b42318", dot: "#f04438" },
  Called: { label: "Called", bg: "#fffaeb", color: "#b54708", dot: "#f79009" },
  Scheduled: { label: "Scheduled", bg: "#eff8ff", color: "#175cd3", dot: "#2e90fa" },
  Confirmed: { label: "Confirmed", bg: "#ecfdf3", color: "#067647", dot: "#17b26a" },
};

const UTILITY_ICONS = { Electric: "\u26A1", Gas: "\uD83D\uDD25", Water: "\uD83D\uDCA7", Internet: "\uD83C\uDF10" };

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- API helpers ---
async function updateUtility(recordId, fields) {
  const res = await fetch("/api/utility", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recordId, fields }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function createProperty(data) {
  const res = await fetch("/api/property", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

async function deleteUtility(recordId) {
  const res = await fetch(`/api/utility?recordId=${encodeURIComponent(recordId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

async function addUtility(data) {
  const res = await fetch("/api/utility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

async function removeProperty(recordId, propertyId) {
  const params = new URLSearchParams({ recordId });
  if (propertyId) params.set("propertyId", propertyId);
  const res = await fetch(`/api/property?${params}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

async function lookupProviders(address) {
  const res = await fetch(`/api/lookup?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error("Lookup failed");
  return res.json();
}

// --- Components ---

function CompanyLogo({ logoUrl, brandColor, companyName }) {
  const [imgError, setImgError] = useState(false);

  if (!logoUrl || imgError) {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: brandColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 16, fontWeight: 700,
      }}>
        {companyName?.charAt(0) || "U"}
      </div>
    );
  }

  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      overflow: "hidden", border: "1px solid #e9eaec",
    }}>
      <img
        src={logoUrl}
        alt=""
        onError={() => setImgError(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function UtilityRow({ utility, brandColor, onFieldChange, onRemove, managing }) {
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const icon = UTILITY_ICONS[utility.utility_type] || "\u2699\uFE0F";
  const statusCfg = STATUS_CONFIG[utility.status] || STATUS_CONFIG["Not Started"];

  const handleChange = async (field, value) => {
    setSaving(true);
    try {
      await updateUtility(utility.id, { [field]: value });
      onFieldChange(utility.id, field, value);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!confirm(`Remove ${utility.utility_type} from this property?`)) return;
    setRemoving(true);
    try {
      await deleteUtility(utility.id);
      onRemove(utility.id);
    } catch (e) {
      console.error(e);
    }
    setRemoving(false);
  };

  return (
    <div style={{
      border: "1px solid #e9eaec", borderRadius: 10, background: "#fff",
      overflow: "hidden", transition: "box-shadow 0.2s ease",
      opacity: saving || removing ? 0.7 : 1,
    }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10, marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
                {utility.utility_type}
              </div>
              <input
                defaultValue={utility.provider_name}
                onBlur={(e) => {
                  if (e.target.value !== utility.provider_name) {
                    handleChange("provider_name", e.target.value);
                  }
                }}
                placeholder="Provider name"
                style={{
                  fontSize: 13, color: "#667085", border: "none", background: "transparent",
                  outline: "none", padding: 0, width: "100%",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {managing && (
              <button
                onClick={handleRemove}
                disabled={removing}
                style={{
                  background: "#fef3f2", color: "#b42318", border: "1px solid #fecdca",
                  borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Remove
              </button>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f9fafb", borderRadius: 6, border: "1px solid #e9eaec", padding: "4px 6px 4px 10px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <input
                defaultValue={utility.provider_phone}
                onBlur={(e) => {
                  if (e.target.value !== utility.provider_phone) {
                    handleChange("provider_phone", e.target.value);
                  }
                }}
                placeholder="Phone"
                style={{
                  fontSize: 13, color: "#344054", border: "none", background: "transparent",
                  outline: "none", width: 120, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                }}
              />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f9fafb", borderRadius: 6, border: "1px solid #e9eaec", padding: "4px 6px 4px 10px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              <input
                defaultValue={utility.provider_website}
                onBlur={(e) => {
                  if (e.target.value !== utility.provider_website) {
                    handleChange("provider_website", e.target.value);
                  }
                }}
                placeholder="Website"
                style={{
                  fontSize: 12, color: "#667085", border: "none", background: "transparent",
                  outline: "none", width: 130,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        }}>
          <select
            value={utility.transfer_to}
            onChange={(e) => handleChange("transfer_to", e.target.value)}
            style={{
              fontSize: 13, padding: "6px 10px", borderRadius: 6,
              border: "1px solid #d0d5dd", background: "#fff",
              color: utility.transfer_to ? "#1a1a2e" : "#98a2b3",
              cursor: "pointer", outline: "none", minWidth: 140,
            }}
          >
            <option value="">Transfer to...</option>
            <option value="Owner">Owner</option>
            <option value="PM Master Acct">PM Master Acct</option>
            <option value="Disconnect">Disconnect</option>
          </select>

          <input
            type="date"
            value={utility.target_date}
            onChange={(e) => handleChange("target_date", e.target.value)}
            style={{
              fontSize: 13, padding: "6px 10px", borderRadius: 6,
              border: "1px solid #d0d5dd",
              color: utility.target_date ? "#1a1a2e" : "#98a2b3",
              outline: "none", minWidth: 130,
            }}
          />

          <select
            value={utility.status}
            onChange={(e) => handleChange("status", e.target.value)}
            style={{
              fontSize: 13, padding: "6px 10px", borderRadius: 6,
              border: `1px solid ${statusCfg.dot}40`,
              background: statusCfg.bg, color: statusCfg.color,
              fontWeight: 600, cursor: "pointer", outline: "none", minWidth: 120,
            }}
          >
            <option value="Not Started">Not Started</option>
            <option value="Called">Called</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f2f4f7", padding: "0 16px" }}>
        <button onClick={() => setShowNotes(!showNotes)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: "#98a2b3", padding: "8px 0",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: showNotes ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
          {utility.notes ? "View note" : "Add note"}
        </button>
        {showNotes && (
          <textarea
            defaultValue={utility.notes}
            onBlur={(e) => {
              if (e.target.value !== utility.notes) {
                handleChange("notes", e.target.value);
              }
            }}
            placeholder="e.g., Account #48291, ask for Sandra in transfers dept..."
            rows={2}
            style={{
              width: "100%", fontSize: 13, padding: "8px 10px",
              borderRadius: 6, border: "1px solid #e9eaec",
              resize: "vertical", outline: "none", marginBottom: 10,
              color: "#344054", boxSizing: "border-box",
            }}
          />
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property, brandColor, onUtilityChange, onUtilityRemove, onUtilityAdd, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(true);
  const [managing, setManaging] = useState(false);
  const [showAddUtil, setShowAddUtil] = useState(false);
  const [addingType, setAddingType] = useState("");
  const [addingLoading, setAddingLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const daysLeft = daysUntil(property.tenant_move_out);
  const allConfirmed = property.utilities.length > 0 && property.utilities.every((u) => u.status === "Confirmed");
  const confirmedCount = property.utilities.filter((u) => u.status === "Confirmed").length;
  const total = property.utilities.length;

  const existingTypes = property.utilities.map((u) => u.utility_type);
  const availableTypes = ["Electric", "Gas", "Water", "Internet"].filter((t) => !existingTypes.includes(t));

  const handleAddUtility = async () => {
    if (!addingType) return;
    setAddingLoading(true);
    try {
      const created = await addUtility({
        property_id: property.property_id,
        utility_type: addingType,
      });
      onUtilityAdd(property.property_id, created);
      setAddingType("");
      setShowAddUtil(false);
    } catch (e) {
      console.error(e);
    }
    setAddingLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${property.address}" and all its utility records? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await removeProperty(property.id, property.property_id);
      onDelete(property.id);
    } catch (e) {
      console.error(e);
    }
    setDeleting(false);
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: allConfirmed ? "1px solid #b8e6c8" : "1px solid #e2e4e9",
      overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      opacity: deleting ? 0.5 : 1, transition: "opacity 0.2s ease",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", cursor: "pointer",
          background: allConfirmed ? "#f6fef9" : "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: allConfirmed ? "#ecfdf3" : "#f9fafb",
            border: `1px solid ${allConfirmed ? "#b8e6c8" : "#e9eaec"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            {allConfirmed ? "\u2705" : "\uD83C\uDFE0"}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>
              {property.address}
            </div>
            <div style={{
              fontSize: 13, color: "#667085",
              display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap",
            }}>
              <span>{property.city}, {property.state} {property.zip}</span>
              {property.tenant_move_out && (
                <>
                  <span style={{ color: "#d0d5dd" }}>|</span>
                  <span>Move-out: {formatDate(property.tenant_move_out)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#667085",
          }}>
            <span style={{ fontWeight: 600, color: allConfirmed ? "#067647" : "#344054" }}>
              {confirmedCount}/{total}
            </span>
            <div style={{
              width: 48, height: 5, borderRadius: 3, background: "#f2f4f7", overflow: "hidden",
            }}>
              <div style={{
                width: total > 0 ? `${(confirmedCount / total) * 100}%` : "0%",
                height: "100%", borderRadius: 3,
                background: allConfirmed ? "#17b26a" : brandColor,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {property.tenant_move_out && (() => {
            const urgent = !allConfirmed && daysLeft <= 3;
            const warning = !allConfirmed && daysLeft <= 7;
            const soon = !allConfirmed && daysLeft <= 14;
            const overdue = daysLeft <= 0 && !allConfirmed;
            const bg = overdue ? "#fef3f2" : urgent ? "#fef3f2" : warning ? "#fffaeb" : soon ? "#eff8ff" : allConfirmed ? "#ecfdf3" : "#f9fafb";
            const fg = overdue ? "#b42318" : urgent ? "#b42318" : warning ? "#b54708" : soon ? "#175cd3" : allConfirmed ? "#067647" : "#667085";
            const text = overdue ? "Overdue" : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`;
            return (
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: "3px 8px", borderRadius: 100,
                background: bg, color: fg,
                letterSpacing: "0.02em", textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {text}
              </span>
            );
          })()}

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98a2b3" strokeWidth="2.5"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Manage utilities toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setManaging(!managing); if (managing) setShowAddUtil(false); }}
                style={{
                  background: managing ? "#f9fafb" : "none",
                  border: managing ? "1px solid #d0d5dd" : "1px solid transparent",
                  borderRadius: 6, padding: "4px 10px",
                  fontSize: 12, fontWeight: 500, color: managing ? "#344054" : "#98a2b3",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                {managing ? "Done managing" : "Manage utilities"}
              </button>
              {managing && (
                <>
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(property); }}
                  style={{
                    background: "#eff8ff", color: "#175cd3", border: "1px solid #b2ddff",
                    borderRadius: 6, padding: "4px 10px",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Duplicate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  disabled={deleting}
                  style={{
                    background: "#fef3f2", color: "#b42318", border: "1px solid #fecdca",
                    borderRadius: 6, padding: "4px 10px",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                  {deleting ? "Deleting..." : "Delete property"}
                </button>
                </>
              )}
            </div>

            {managing && availableTypes.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAddUtil(!showAddUtil); }}
                style={{
                  background: brandColor, color: "#fff", border: "none",
                  borderRadius: 6, padding: "4px 10px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add utility
              </button>
            )}
          </div>

          {/* Add utility inline form */}
          {showAddUtil && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", background: "#f9fafb",
              borderRadius: 8, border: "1px solid #e9eaec",
            }}>
              <select
                value={addingType}
                onChange={(e) => setAddingType(e.target.value)}
                style={{
                  fontSize: 13, padding: "6px 10px", borderRadius: 6,
                  border: "1px solid #d0d5dd", background: "#fff",
                  color: addingType ? "#1a1a2e" : "#98a2b3",
                  cursor: "pointer", outline: "none", flex: 1,
                }}
              >
                <option value="">Select utility type...</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{UTILITY_ICONS[t] || "\u2699\uFE0F"} {t}</option>
                ))}
              </select>
              <button
                onClick={handleAddUtility}
                disabled={!addingType || addingLoading}
                style={{
                  fontSize: 13, fontWeight: 600,
                  background: brandColor, color: "#fff", border: "none",
                  borderRadius: 6, padding: "6px 14px", cursor: "pointer",
                  opacity: !addingType || addingLoading ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {addingLoading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => { setShowAddUtil(false); setAddingType(""); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "#98a2b3", padding: "6px",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {property.utilities.map((u) => (
            <UtilityRow
              key={u.id}
              utility={u}
              brandColor={brandColor}
              onFieldChange={onUtilityChange}
              onRemove={(utilityId) => onUtilityRemove(property.property_id, utilityId)}
              managing={managing}
            />
          ))}

          {property.utilities.length === 0 && (
            <div style={{
              padding: "20px", textAlign: "center",
              fontSize: 13, color: "#98a2b3",
              background: "#f9fafb", borderRadius: 8,
            }}>
              No utilities tracked yet for this property.
            </div>
          )}

          {allConfirmed && (
            <div style={{
              marginTop: 4, padding: "14px 16px",
              background: `${brandColor}08`,
              border: `1px dashed ${brandColor}40`,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: brandColor }}>
                  Ready for the next tenant?
                </div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                  Auto-send a branded utility setup checklist when this property leases.
                </div>
              </div>
              <button style={{
                fontSize: 13, fontWeight: 600,
                background: brandColor, color: "#fff", border: "none",
                borderRadius: 8, padding: "9px 18px", cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                Enable auto-setup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  fontSize: 14,
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  color: "#1a1a2e",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function AddPropertyModal({ companySlug, brandColor, onAdd, onClose, template }) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(template?.city || "");
  const [state, setState] = useState(template?.state || "");
  const [zip, setZip] = useState("");
  const [moveOut, setMoveOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState(null);

  // foundUtilities: array of { type, label, icon, provider_name, provider_phone, provider_website, checked }
  const [foundUtilities, setFoundUtilities] = useState(() => {
    if (!template?.utilities?.length) return null;
    const UTIL_ICONS = { Electric: "\u26A1", Gas: "\uD83D\uDD25", Water: "\uD83D\uDCA7" };
    return template.utilities.map((u) => ({
      type: u.utility_type.toLowerCase(),
      label: u.utility_type,
      icon: UTIL_ICONS[u.utility_type] || "\u2699\uFE0F",
      provider_name: u.provider_name || "",
      provider_phone: u.provider_phone || "",
      provider_website: u.provider_website || "",
      checked: true,
    }));
  });

  const UTIL_META = {
    electric: { label: "Electric", icon: "\u26A1" },
    gas: { label: "Gas", icon: "\uD83D\uDD25" },
    water: { label: "Water", icon: "\uD83D\uDCA7" },
  };

  const canLookup = address && city && state;

  const handleLookup = async () => {
    if (!canLookup) return;
    setLookingUp(true);
    setError(null);
    setFoundUtilities(null);

    try {
      const fullAddress = `${address}, ${city}, ${state}${zip ? " " + zip : ""}`;
      const data = await lookupProviders(fullAddress);

      const results = [];
      for (const [key, meta] of Object.entries(UTIL_META)) {
        const entry = data[key];
        if (entry && entry.provider_name) {
          results.push({
            type: key,
            label: meta.label,
            icon: meta.icon,
            provider_name: entry.provider_name,
            provider_phone: entry.phone || "",
            provider_website: entry.website || "",
            checked: true,
          });
        }
      }
      setFoundUtilities(results);
      if (results.length === 0) {
        setError("No utility providers found for this address. You can still add the property.");
      }
    } catch (e) {
      console.error(e);
      setError("Provider lookup failed. You can still add the property with default utilities.");
      // Fall back to manual checkboxes
      setFoundUtilities([
        { type: "electric", label: "Electric", icon: "\u26A1", provider_name: "", provider_phone: "", provider_website: "", checked: true },
        { type: "gas", label: "Gas", icon: "\uD83D\uDD25", provider_name: "", provider_phone: "", provider_website: "", checked: true },
        { type: "water", label: "Water", icon: "\uD83D\uDCA7", provider_name: "", provider_phone: "", provider_website: "", checked: true },
      ]);
    }
    setLookingUp(false);
  };

  const toggleUtility = (type) => {
    setFoundUtilities((prev) =>
      prev.map((u) => u.type === type ? { ...u, checked: !u.checked } : u)
    );
  };

  const updateProviderName = (type, name) => {
    setFoundUtilities((prev) =>
      prev.map((u) => u.type === type ? { ...u, provider_name: name } : u)
    );
  };

  const handleSubmit = async () => {
    if (!address || !city || !state) return;
    setLoading(true);
    setError(null);

    const utilities = (foundUtilities || [])
      .filter((u) => u.checked)
      .map((u) => ({
        utility_type: u.label,
        provider_name: u.provider_name || "",
        provider_phone: u.provider_phone || "",
        provider_website: u.provider_website || "",
      }));

    try {
      const res = await createProperty({
        company_slug: companySlug,
        address,
        city,
        state,
        zip,
        tenant_move_out: moveOut || null,
        utilities,
      });
      onAdd(res.property);
      onClose();
    } catch (e) {
      setError("Failed to create property. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: "#1a1a2e",
          margin: "0 0 20px",
        }}>Add Move-Out Property</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="Street address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              placeholder="Zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, color: "#667085",
              display: "block", marginBottom: 4,
            }}>Tenant move-out date</label>
            <input
              type="date"
              value={moveOut}
              onChange={(e) => setMoveOut(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Lookup button */}
          {!foundUtilities && (
            <button
              onClick={handleLookup}
              disabled={!canLookup || lookingUp}
              style={{
                fontSize: 14, fontWeight: 600,
                background: canLookup ? brandColor : "#e9eaec",
                color: canLookup ? "#fff" : "#98a2b3",
                border: "none", borderRadius: 8, padding: "10px 18px",
                cursor: canLookup ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              {lookingUp ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite", display: "inline-block",
                  }} />
                  Looking up providers...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  Look up providers
                </>
              )}
            </button>
          )}

          {/* Utility results */}
          {foundUtilities && (
            <div>
              <label style={{
                fontSize: 12, color: "#667085",
                display: "block", marginBottom: 8,
              }}>Utilities to track</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {foundUtilities.map((u) => (
                  <label key={u.type} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 14, color: "#344054", cursor: "pointer",
                    padding: "8px 12px", borderRadius: 8,
                    background: u.checked ? "#f9fafb" : "#fff",
                    border: u.checked ? "1px solid #d0d5dd" : "1px solid #e9eaec",
                    transition: "all 0.15s ease",
                  }}>
                    <input
                      type="checkbox"
                      checked={u.checked}
                      onChange={() => toggleUtility(u.type)}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{u.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{u.label}</div>
                      <input
                        value={u.provider_name}
                        onChange={(e) => updateProviderName(u.type, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Provider name"
                        style={{
                          fontSize: 12, padding: "4px 8px", borderRadius: 5,
                          border: "1px solid #e9eaec", background: "#fff",
                          color: "#344054", width: "100%", outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => { setFoundUtilities(null); setError(null); }}
                style={{
                  marginTop: 8, fontSize: 12, color: "#667085",
                  background: "none", border: "none", cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Re-lookup providers
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: 12, fontSize: 13, color: "#b42318",
            padding: "8px 12px", background: "#fef3f2", borderRadius: 6,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            fontSize: 14, fontWeight: 500,
            background: "#f9fafb", color: "#344054", border: "1px solid #d0d5dd",
            borderRadius: 8, padding: "9px 18px", cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !address || !city || !state}
            style={{
              fontSize: 14, fontWeight: 600,
              background: brandColor, color: "#fff", border: "none",
              borderRadius: 8, padding: "9px 18px", cursor: "pointer",
              opacity: loading || !address || !city || !state ? 0.5 : 1,
            }}
          >
            {loading ? "Adding..." : "Add Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function TrackerPage({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addTemplate, setAddTemplate] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, needs_attention, in_progress, confirmed

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/company?slug=${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setError("not_found");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError("error");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleUtilityChange = useCallback((utilityId, field, value) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: prev.properties.map((p) => ({
          ...p,
          utilities: p.utilities.map((u) =>
            u.id === utilityId ? { ...u, [field]: value } : u
          ),
        })),
      };
    });
  }, []);

  const handleAddProperty = useCallback((newProperty) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: [...prev.properties, newProperty],
      };
    });
  }, []);

  const handleUtilityRemove = useCallback((propertyId, utilityId) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: prev.properties.map((p) =>
          p.property_id === propertyId
            ? { ...p, utilities: p.utilities.filter((u) => u.id !== utilityId) }
            : p
        ),
      };
    });
  }, []);

  const handleUtilityAdd = useCallback((propertyId, newUtility) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: prev.properties.map((p) =>
          p.property_id === propertyId
            ? { ...p, utilities: [...p.utilities, newUtility] }
            : p
        ),
      };
    });
  }, []);

  const handleDuplicate = useCallback((property) => {
    setAddTemplate({
      city: property.city,
      state: property.state,
      utilities: property.utilities,
    });
    setShowAdd(true);
  }, []);

  const handleDeleteProperty = useCallback((recordId) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: prev.properties.filter((p) => p.id !== recordId),
      };
    });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #e9eaec",
          borderTopColor: "#1a1a2e", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: 14, color: "#667085" }}>Loading your properties...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontSize: 48 }}>{"\uD83C\uDFE0"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>Page not found</div>
        <div style={{ fontSize: 14, color: "#667085" }}>
          This tracker link may have expired or the URL is incorrect.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#b42318" }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: "#667085" }}>Please try refreshing the page.</div>
      </div>
    );
  }

  const { company } = data;
  const brandColor = company.brand_color || "#1B3E6F";

  // Sort properties: closest move-out date first, no date last
  const sortedProperties = [...data.properties].sort((a, b) => {
    if (!a.tenant_move_out && !b.tenant_move_out) return 0;
    if (!a.tenant_move_out) return 1;
    if (!b.tenant_move_out) return -1;
    return new Date(a.tenant_move_out) - new Date(b.tenant_move_out);
  });

  // Apply search and filter
  const properties = sortedProperties.filter((p) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const matchAddr = p.address.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchProvider = p.utilities.some((u) =>
        (u.provider_name || "").toLowerCase().includes(q)
      );
      if (!matchAddr && !matchCity && !matchProvider) return false;
    }
    // Status filter
    if (statusFilter === "needs_attention") {
      const d = daysUntil(p.tenant_move_out);
      return d <= 7 && !p.utilities.every((u) => u.status === "Confirmed");
    }
    if (statusFilter === "in_progress") {
      return p.utilities.some((u) => u.status !== "Not Started" && u.status !== "Confirmed");
    }
    if (statusFilter === "confirmed") {
      return p.utilities.length > 0 && p.utilities.every((u) => u.status === "Confirmed");
    }
    return true;
  });

  const totalUtils = sortedProperties.reduce((acc, p) => acc + p.utilities.length, 0);
  const confirmedUtils = sortedProperties.reduce(
    (acc, p) => acc + p.utilities.filter((u) => u.status === "Confirmed").length, 0
  );
  const urgentCount = sortedProperties.filter((p) => {
    const d = daysUntil(p.tenant_move_out);
    return d <= 7 && !p.utilities.every((u) => u.status === "Confirmed");
  }).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
      {/* Top bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e9eaec",
        padding: "12px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CompanyLogo
            logoUrl={company.logo_url}
            brandColor={brandColor}
            companyName={company.company_name}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
              {company.company_name}
            </div>
            <div style={{ fontSize: 11, color: "#98a2b3", letterSpacing: "0.04em" }}>
              MOVE-OUT TRACKER
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#667085" }}>
          Powered by{" "}
          <span style={{ fontWeight: 600, color: brandColor }}>Utility Profit</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats bar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Active Move-Outs", value: properties.length, icon: "\uD83D\uDCCB" },
            { label: "Utilities Confirmed", value: `${confirmedUtils}/${totalUtils}`, icon: "\u2705" },
            { label: "Needs Attention", value: urgentCount, icon: "\u26A0\uFE0F", alert: urgentCount > 0 },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: "1 1 200px", background: "#fff", borderRadius: 12,
              border: stat.alert ? "1px solid #fec84b" : "1px solid #e9eaec",
              padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "#98a2b3", fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Header + add button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              Vacancy Utility Transfers
            </h1>
            <p style={{ fontSize: 14, color: "#667085", margin: "4px 0 0" }}>
              Track and manage utility transfers for your move-outs. Providers auto-identified.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {sortedProperties.length > 0 && (
              <button onClick={() => {
                const rows = [["Address", "City", "State", "Zip", "Move-Out Date", "Utility", "Provider", "Phone", "Website", "Transfer To", "Target Date", "Status", "Notes"]];
                for (const p of sortedProperties) {
                  if (p.utilities.length === 0) {
                    rows.push([p.address, p.city, p.state, p.zip, p.tenant_move_out, "", "", "", "", "", "", "", ""]);
                  } else {
                    for (const u of p.utilities) {
                      rows.push([p.address, p.city, p.state, p.zip, p.tenant_move_out, u.utility_type, u.provider_name, u.provider_phone, u.provider_website, u.transfer_to, u.target_date, u.status, u.notes]);
                    }
                  }
                }
                const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `utility-transfers-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }} style={{
                fontSize: 13, fontWeight: 600,
                background: "#fff", color: "#344054", border: "1px solid #e9eaec",
                borderRadius: 10, padding: "10px 18px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Export CSV
              </button>
            )}
            <button onClick={() => setShowAdd(true)} style={{
              fontSize: 14, fontWeight: 600,
              background: brandColor, color: "#fff", border: "none",
              borderRadius: 10, padding: "11px 22px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: `0 2px 8px ${brandColor}30`,
              whiteSpace: "nowrap",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Move-Out
            </button>
          </div>
        </div>

        {/* Search & filter bar */}
        {sortedProperties.length > 0 && (
          <div style={{
            display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center",
          }}>
            <div style={{
              flex: "1 1 220px", display: "flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1px solid #e9eaec", borderRadius: 8,
              padding: "8px 12px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#98a2b3" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search address, city, or provider..."
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: "#344054", width: "100%",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: "#98a2b3", fontSize: 16, lineHeight: 1,
                }}>&times;</button>
              )}
            </div>
            {[
              { key: "all", label: "All" },
              { key: "needs_attention", label: "Needs Attention" },
              { key: "in_progress", label: "In Progress" },
              { key: "confirmed", label: "Confirmed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "7px 14px",
                  borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
                  border: statusFilter === f.key ? `1px solid ${brandColor}` : "1px solid #e9eaec",
                  background: statusFilter === f.key ? `${brandColor}10` : "#fff",
                  color: statusFilter === f.key ? brandColor : "#667085",
                  transition: "all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Property cards */}
        {properties.length === 0 && !search && statusFilter === "all" ? (
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid #e2e4e9",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{"\uD83C\uDFE0"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>
              No move-outs being tracked yet
            </div>
            <div style={{ fontSize: 14, color: "#667085", marginTop: 4 }}>
              Click "Add Move-Out" to start tracking utility transfers for a property.
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid #e2e4e9",
            padding: "36px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, color: "#667085" }}>
              No properties match your {search ? "search" : "filter"}.
            </div>
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} style={{
              marginTop: 10, fontSize: 13, color: brandColor, background: "none",
              border: "none", cursor: "pointer", fontWeight: 600,
            }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {properties.map((p) => (
              <PropertyCard
                key={p.id || p.property_id}
                property={p}
                brandColor={brandColor}
                onUtilityChange={handleUtilityChange}
                onUtilityRemove={handleUtilityRemove}
                onUtilityAdd={handleUtilityAdd}
                onDelete={handleDeleteProperty}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        {/* Bottom upsell */}
        <div style={{
          marginTop: 32, padding: "20px 24px",
          background: "#fff", borderRadius: 14,
          border: "1px solid #e2e4e9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>{"\uD83D\uDD04"}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
                Want this for all your properties?
              </div>
              <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>
                We can map providers for your entire portfolio and auto-track every move-out.
              </div>
            </div>
          </div>
          <button style={{
            fontSize: 13, fontWeight: 600,
            background: "#f9fafb", color: brandColor,
            border: `1px solid ${brandColor}40`,
            borderRadius: 8, padding: "9px 18px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            Get full portfolio setup
          </button>
        </div>
      </div>

      {showAdd && (
        <AddPropertyModal
          companySlug={slug}
          brandColor={brandColor}
          onAdd={handleAddProperty}
          onClose={() => { setShowAdd(false); setAddTemplate(null); }}
          template={addTemplate}
        />
      )}

      <style>{`
        select:focus, input:focus { border-color: ${brandColor}80 !important; box-shadow: 0 0 0 3px ${brandColor}15; }
      `}</style>
    </div>
  );
}
