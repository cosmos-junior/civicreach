import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API } from "./api";

interface Report {
  id: number;
  latitude: number;
  longitude: number;
  location_name: string;
  message: string;
  created_at: string;
}

export default function HeatmapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapLayerRef = useRef<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(6);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await API.get("/reports/");
      setReports(response.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !reports.length) return;

    // Initialize map on Kenya coordinates
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-0.0236, 37.9062], zoomLevel);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    // Convert reports to heatmap data format [lat, lng, intensity]
    const heatmapData = reports
      .filter((r) => r.latitude && r.longitude)
      .map((r) => [r.latitude, r.longitude, 1]);

    // Remove old heatmap layer
    if (heatmapLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
    }

    // Add new heatmap with dynamic scaling
    if (heatmapData.length > 0) {
      heatmapLayerRef.current = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        gradient: {
          0.4: "#003366",
          0.5: "#0066ff",
          0.6: "#00ffff",
          0.7: "#00ff00",
          0.8: "#ffff00",
          1.0: "#ff0000",
        },
      }).addTo(mapInstanceRef.current);
    }

    // Add cluster markers for better visibility
    reports
      .filter((r) => r.latitude && r.longitude)
      .forEach((report) => {
        const marker = L.circleMarker([report.latitude, report.longitude], {
          radius: 6,
          fillColor: "#ff6b35",
          color: "#fff",
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.6,
        });

        marker.bindPopup(
          `<div style="font-size: 12px; max-width: 200px;">
            <strong>${report.location_name}</strong><br/>
            ${report.message?.substring(0, 100) || "No description"}...<br/>
            <small>${new Date(report.created_at).toLocaleDateString()}</small>
          </div>`
        );

        marker.addTo(mapInstanceRef.current!);
      });

    // Fit map bounds to all reports
    if (heatmapData.length > 0) {
      const bounds = L.latLngBounds(
        heatmapData.map((d) => [d[0], d[1]] as [number, number])
      );
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [reports]);

  // Handle zoom changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mapInstanceRef.current) {
      const handleZoom = () => {
        setZoomLevel(mapInstanceRef.current?.getZoom() || 6);
      };
      mapInstanceRef.current.on("zoom", handleZoom);
      return () => {
        mapInstanceRef.current?.off("zoom", handleZoom);
      };
    }
  }, []);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>Incident Heatmap 🔥</h2>
        <div className="heatmap-stats">
          <span className="stat-badge">
            Total Reports: <strong>{reports.length}</strong>
          </span>
          <button
            className="heatmap-refresh"
            onClick={fetchReports}
            disabled={loading}
            aria-label="Refresh heatmap data"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div ref={mapRef} className="heatmap-map" />

      <div className="heatmap-legend">
        <h4>Heat Intensity</h4>
        <div className="legend-gradient">
          <span className="gradient-label">Low</span>
          <div className="gradient-bar"></div>
          <span className="gradient-label">High</span>
        </div>
        <p className="legend-info">
          Darker red areas indicate higher concentration of incident reports
        </p>
      </div>

      <div className="heatmap-info">
        <h4>Recent Reports</h4>
        {reports.length === 0 ? (
          <p>No reports yet</p>
        ) : (
          <div className="reports-list">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-location">
                  <span className="location-badge">{report.location_name}</span>
                  <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="report-message">
                  {report.message?.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}