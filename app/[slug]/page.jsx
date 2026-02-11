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

// --- Components ---

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Not Started"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px 3px 8px", borderRadius: 100,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function UtilityRow({ utility, brandColor, onFieldChange }) {
  const [showNotes, setShowNotes] = useState(false);
  const [saving, setSaving] = useState(false);
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

  return (
    <div style={{
      border: "1px solid #e9eaec", borderRadius: 10, background: "#fff",
      overflow: "hidden", transition: "box-shadow 0.2s ease",
      opacity: saving ? 0.7 : 1,
    }}>
      {/* Desktop layout */}
      <div style={{ padding: "14px 16px" }}>
        {/* Top: provider info + contact */}
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
              <div style={{ fontSize: 13, color: "#667085" }}>
                {utility.provider_name}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {utility.provider_phone && (
              <a href={`tel:${utility.provider_phone}`} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 13, color: "#344054", textDecoration: "none",
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                padding: "4px 10px", background: "#f9fafb", borderRadius: 6,
                border: "1px solid #e9eaec",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {utility.provider_phone}
              </a>
            )}
            {utility.provider_website && (
              <a href={utility.provider_website} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 12, color: "#667085", textDecoration: "none",
                padding: "4px 10px", background: "#f9fafb", borderRadius: 6,
                border: "1px solid #e9eaec",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
                Website
              </a>
            )}
          </div>
        </div>

        {/* Bottom: controls row */}
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

      {/* Notes toggle */}
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

function PropertyCard({ property, brandColor, onUtilityChange }) {
  const [expanded, setExpanded] = useState(true);
  const daysLeft = daysUntil(property.tenant_move_out);
  const allConfirmed = property.utilities.every((u) => u.status === "Confirmed");
  const confirmedCount = property.utilities.filter((u) => u.status === "Confirmed").length;
  const total = property.utilities.length;

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: allConfirmed ? "1px solid #b8e6c8" : "1px solid #e2e4e9",
      overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Header */}
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

          {!allConfirmed && daysLeft <= 7 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 8px", borderRadius: 100,
              background: daysLeft <= 3 ? "#fef3f2" : "#fffaeb",
              color: daysLeft <= 3 ? "#b42318" : "#b54708",
              letterSpacing: "0.02em", textTransform: "uppercase",
            }}>
              {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
            </span>
          )}

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98a2b3" strokeWidth="2.5"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Utilities */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {property.utilities.map((u) => (
            <UtilityRow
              key={u.id}
              utility={u}
              brandColor={brandColor}
              onFieldChange={onUtilityChange}
            />
          ))}

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

// --- Main Page ---

export default function TrackerPage({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Loading state
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

  // Not found
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

  // Error
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

  const { company, properties } = data;
  const brandColor = company.brand_color || "#1B3E6F";

  const totalUtils = properties.reduce((acc, p) => acc + p.utilities.length, 0);
  const confirmedUtils = properties.reduce(
    (acc, p) => acc + p.utilities.filter((u) => u.status === "Confirmed").length, 0
  );
  const urgentCount = properties.filter((p) => {
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
          {company.logo_url ? (
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: brandColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <img
                src={company.logo_url}
                alt=""
                style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(10)" }}
              />
            </div>
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: brandColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 16, fontWeight: 700,
            }}>
              {company.company_name?.charAt(0) || "U"}
            </div>
          )}
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

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
            Vacancy Utility Transfers
          </h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "4px 0 0" }}>
            Track and manage utility transfers for your move-outs. Providers auto-identified.
          </p>
        </div>

        {/* Property cards */}
        {properties.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid #e2e4e9",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{"\uD83C\uDFE0"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>
              No move-outs being tracked yet
            </div>
            <div style={{ fontSize: 14, color: "#667085", marginTop: 4 }}>
              Properties will appear here when we detect vacancies in your portfolio.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                brandColor={brandColor}
                onUtilityChange={handleUtilityChange}
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

      <style>{`
        select:focus, input:focus { border-color: ${brandColor}80 !important; box-shadow: 0 0 0 3px ${brandColor}15; }
      `}</style>
    </div>
  );
}
