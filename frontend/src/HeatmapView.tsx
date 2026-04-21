import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API } from "./api";
import { useNavigate } from "react-router-dom";
import voteBg from "./assets/votebg.jpg";

// ── Types ────────────────────────────────────────────────────────────────────
interface Report {
  id: number;
  latitude: number;
  longitude: number;
  location_name: string;
  county: string;
  message: string;
  incident_type: string;
  incident_type_display: string;
  severity_weight: number;
  created_at: string;
}

type IncidentFilter = "all" | "low_registration" | "intimidation" | "violence" | "bribery" | "other";

interface Filters {
  incident_type: IncidentFilter;
  date_from: string;
  date_to: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const INCIDENT_FILTERS: { value: IncidentFilter; label: string; color: string }[] = [
  { value: "all",              label: "All",              color: "#10b981" },
  { value: "low_registration", label: "Low Registration", color: "#3b82f6" },
  { value: "intimidation",     label: "Intimidation",     color: "#f59e0b" },
  { value: "violence",         label: "Violence",         color: "#ef4444" },
  { value: "bribery",          label: "Bribery",          color: "#8b5cf6" },
  { value: "other",            label: "Other",            color: "#6b7280" },
];

const INCIDENT_COLORS: Record<string, string> = {
  low_registration: "#3b82f6",
  intimidation:     "#f59e0b",
  violence:         "#ef4444",
  bribery:          "#8b5cf6",
  other:            "#6b7280",
};

const AUTO_REFRESH_INTERVAL = 60_000; // 1 minute
const SIDEBAR_PAGE_SIZE = 8;

// ── Component ────────────────────────────────────────────────────────────────
export default function HeatmapView() {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstance   = useRef<L.Map | null>(null);
  const heatLayer     = useRef<any>(null);
  const markersGroup  = useRef<L.LayerGroup | null>(null);

  const [reports,   setReports]   = useState<Report[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filters,   setFilters]   = useState<Filters>({ incident_type: "all", date_from: "", date_to: "" });
  const [sidebarPage, setSidebarPage] = useState(0);
  const [mapReady,  setMapReady]  = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const navigate = useNavigate();

  // ── Fetch reports from API ─────────────────────────────────────────────────
  const fetchReports = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (currentFilters.incident_type !== "all") params.incident_type = currentFilters.incident_type;
      if (currentFilters.date_from) params.date_from = currentFilters.date_from;
      if (currentFilters.date_to)   params.date_to   = currentFilters.date_to;

      const response = await API.get("/reports/", { params });
      // Handle both paginated (results array) and plain array responses
      const data = response.data?.results ?? response.data ?? [];
      setReports(Array.isArray(data) ? data : []);
      setLastRefreshed(new Date());
      setSidebarPage(0);
    } catch {
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchReports(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-refresh every 60 seconds ─────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => fetchReports(filters), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [filters, fetchReports]);

  // ── Initialize Leaflet map (once, on mount) ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([-0.0236, 37.9062], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    markersGroup.current = L.layerGroup().addTo(map);
    mapInstance.current  = map;
    setMapReady(true);

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstance.current = null;
      markersGroup.current = null;
      setMapReady(false);
    };
  }, []);

  // ── Update heatmap + markers whenever reports change ──────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    const map = mapInstance.current;

    // Remove previous heatmap layer
    if (heatLayer.current) {
      map.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }

    // Clear all markers cleanly via LayerGroup
    markersGroup.current?.clearLayers();

    const validReports = reports.filter((r) => r.latitude && r.longitude);

    if (validReports.length === 0) return;

    // Build heatmap data with severity weights
    const heatData = validReports.map((r) => [
      r.latitude,
      r.longitude,
      r.severity_weight ?? 0.5,
    ]);

    heatLayer.current = L.heatLayer(heatData as any, {
      radius: 28,
      blur: 18,
      maxZoom: 18,
      gradient: {
        0.4: "#003366",
        0.5: "#0066ff",
        0.6: "#00ffff",
        0.7: "#00ff00",
        0.8: "#ffff00",
        1.0: "#ff0000",
      },
    }).addTo(map);

    // Add circle markers per incident type
    validReports.forEach((report) => {
      const color = INCIDENT_COLORS[report.incident_type] ?? "#10b981";
      const preview =
        report.message && report.message.length > 100
          ? report.message.substring(0, 100) + "…"
          : report.message || "No description";

      const marker = L.circleMarker([report.latitude, report.longitude], {
        radius: 7,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 0.85,
        fillOpacity: 0.75,
      });

      marker.bindPopup(
        `<div class="heatmap-popup">
          <div class="popup-type" style="background:${color}20;color:${color};border-color:${color}40">
            ${report.incident_type_display || report.incident_type}
          </div>
          <strong class="popup-location">${report.location_name}${report.county ? `, ${report.county}` : ""}</strong>
          <p class="popup-message">${preview}</p>
          <small class="popup-date">${new Date(report.created_at).toLocaleDateString("en-KE", {
            day: "numeric", month: "short", year: "numeric",
          })}</small>
        </div>`,
        { maxWidth: 240 }
      );

      markersGroup.current?.addLayer(marker);
    });

    // Fit bounds to show all reports
    const bounds = L.latLngBounds(validReports.map((r) => [r.latitude, r.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [reports, mapReady]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  const handleIncidentTypeFilter = (type: IncidentFilter) => {
    const updated = { ...filters, incident_type: type };
    handleFilterChange(updated);
  };

  const handleDateFilter = (field: "date_from" | "date_to", value: string) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
  };

  const applyDateFilter = () => fetchReports(filters);

  const resetFilters = () => {
    const reset: Filters = { incident_type: "all", date_from: "", date_to: "" };
    setFilters(reset);
    fetchReports(reset);
  };

  // Pan/zoom map to a specific report
  const panToReport = (report: Report) => {
    if (mapInstance.current && report.latitude && report.longitude) {
      mapInstance.current.setView([report.latitude, report.longitude], 14, { animate: true });
    }
  };

  // ── Sidebar pagination ─────────────────────────────────────────────────────
  const totalPages   = Math.ceil(reports.length / SIDEBAR_PAGE_SIZE);
  const pagedReports = reports.slice(sidebarPage * SIDEBAR_PAGE_SIZE, (sidebarPage + 1) * SIDEBAR_PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="heatmap-container">
      {/* ── Header ── */}
      <div
        className="heatmap-header"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5,10,20,0.88) 0%, rgba(5,20,12,0.82) 100%), url(${voteBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      >
        <div className="heatmap-header-left">
          <button className="heatmap-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <h2 className="heatmap-title">Incident Heatmap 🔥</h2>
            <p className="heatmap-subtitle">
              Live view of reported incidents across Kenya
            </p>
          </div>
        </div>
        <div className="heatmap-header-right">
          <div className="heatmap-stats">
            <span className="stat-badge">
              {loading ? "Loading…" : `${reports.length} report${reports.length !== 1 ? "s" : ""}`}
            </span>
            {lastRefreshed && (
              <span className="stat-badge stat-badge-muted">
                Updated {lastRefreshed.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <button
            className="heatmap-refresh-btn"
            onClick={() => fetchReports(filters)}
            disabled={loading}
            aria-label="Refresh heatmap data"
          >
            <span className={loading ? "spin" : ""}>⟳</span>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="heatmap-alert">⚠️ {error}</div>
      )}

      {/* ── Filter bar ── */}
      <div className="heatmap-filters">
        <div className="filter-chips">
          {INCIDENT_FILTERS.map(({ value, label, color }) => (
            <button
              key={value}
              className={`filter-chip ${filters.incident_type === value ? "active" : ""}`}
              style={filters.incident_type === value ? { borderColor: color, color: color, background: `${color}18` } : {}}
              onClick={() => handleIncidentTypeFilter(value)}
            >
              {value !== "all" && (
                <span className="chip-dot" style={{ background: color }} />
              )}
              {label}
            </button>
          ))}
        </div>
        <div className="filter-dates">
          <label className="date-label">From</label>
          <input
            type="date"
            className="date-input"
            value={filters.date_from}
            onChange={(e) => handleDateFilter("date_from", e.target.value)}
            max={filters.date_to || undefined}
          />
          <label className="date-label">To</label>
          <input
            type="date"
            className="date-input"
            value={filters.date_to}
            onChange={(e) => handleDateFilter("date_to", e.target.value)}
            min={filters.date_from || undefined}
          />
          <button className="filter-apply-btn" onClick={applyDateFilter} disabled={loading}>
            Apply
          </button>
          {(filters.date_from || filters.date_to || filters.incident_type !== "all") && (
            <button className="filter-reset-btn" onClick={resetFilters}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Map + Sidebar layout ── */}
      <div className="heatmap-body">
        {/* Map */}
        <div className="heatmap-map-wrapper">
          <div ref={mapRef} className="heatmap-map" />
          {!loading && reports.length === 0 && (
            <div className="heatmap-empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>No reports found</h3>
              <p>Try adjusting your filters or date range.</p>
              <button className="filter-reset-btn" onClick={resetFilters}>Clear Filters</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="heatmap-sidebar">
          {/* Legend */}
          <div className="heatmap-legend">
            <h4 className="legend-title">Heat Intensity</h4>
            <div className="legend-gradient-row">
              <span className="legend-text">Low</span>
              <div className="legend-gradient-bar" />
              <span className="legend-text">High</span>
            </div>
            <div className="legend-types">
              {INCIDENT_FILTERS.filter((f) => f.value !== "all").map(({ value, label, color }) => (
                <div key={value} className="legend-type-item">
                  <span className="legend-dot" style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report list */}
          <div className="sidebar-reports">
            <div className="sidebar-header">
              <h4>
                Reports
                {filters.incident_type !== "all" && (
                  <span className="sidebar-filter-tag">
                    {INCIDENT_FILTERS.find((f) => f.value === filters.incident_type)?.label}
                  </span>
                )}
              </h4>
              <span className="sidebar-count">{reports.length} total</span>
            </div>

            {loading ? (
              <div className="sidebar-loading">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="report-skeleton" />
                ))}
              </div>
            ) : pagedReports.length === 0 ? (
              <p className="sidebar-empty">No reports match your filters.</p>
            ) : (
              <>
                {pagedReports.map((report) => {
                  const color = INCIDENT_COLORS[report.incident_type] ?? "#10b981";
                  return (
                    <div
                      key={report.id}
                      className="report-card"
                      onClick={() => panToReport(report)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && panToReport(report)}
                      title="Click to zoom to this location"
                    >
                      <div className="report-card-header">
                        <span className="report-type-badge" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>
                          {report.incident_type_display || report.incident_type}
                        </span>
                        <span className="report-date">
                          {new Date(report.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="report-location-name">
                        📍 {report.location_name}{report.county ? `, ${report.county}` : ""}
                      </div>
                      <p className="report-message-preview">
                        {report.message && report.message.length > 70
                          ? report.message.substring(0, 70) + "…"
                          : report.message || "No description"}
                      </p>
                    </div>
                  );
                })}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="sidebar-pagination">
                    <button
                      className="page-btn"
                      onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
                      disabled={sidebarPage === 0}
                    >
                      ‹ Prev
                    </button>
                    <span className="page-info">{sidebarPage + 1} / {totalPages}</span>
                    <button
                      className="page-btn"
                      onClick={() => setSidebarPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={sidebarPage >= totalPages - 1}
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}