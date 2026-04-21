import React, { useEffect, useState } from "react";
import { API } from "./api";
import flagIcon from "./assets/flag.png";
import ddayBg from "./assets/dday.jpg";
import voteBg from "./assets/votebg.jpg";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate, Link } from "react-router-dom";

ChartJS.register(
  CategoryScale, LinearScale, LineElement, PointElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

// ── Types ────────────────────────────────────────────────────────────────────
interface LocationStat {
  location_name: string;
  count: number;
}

interface TypeStat {
  incident_type: string;
  count: number;
}

interface DashboardData {
  total_reports: number;
  reports_by_location: LocationStat[];
  reports_by_type: TypeStat[];
}

interface ReportItem {
  id: number;
  incident_type: string;
  incident_type_display: string;
  location_name: string;
  created_at: string;
}

interface ContactMessageItem {
  id: number;
  user_phone: string;
  message: string;
  created_at: string;
}

interface AlertItem {
  id: number;
  title: string;
  sent_at: string;
}

const TYPE_LABEL_MAP: Record<string, string> = {
  low_registration: "Low Registration",
  intimidation:     "Intimidation",
  violence:         "Violence",
  bribery:          "Bribery",
  other:            "Other",
};

export default function Dashboard() {
  const [dashboardData,    setDashboardData]    = useState<DashboardData | null>(null);
  const [allReports,       setAllReports]       = useState<ReportItem[]>([]);
  const [contactMessages,  setContactMessages]  = useState<ContactMessageItem[]>([]);
  const [alerts,           setAlerts]           = useState<AlertItem[]>([]);
  const [error,            setError]            = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, reportsRes, messagesRes, alertsRes] = await Promise.all([
          API.get("/reports/dashboard/"),
          API.get("/reports/all-reports/"),
          API.get("/reports/all-contact-messages/"),
          API.get("/reports/all-alerts/"),
        ]);
        setDashboardData(dashboardRes.data);
        // Handle paginated responses
        setAllReports(reportsRes.data?.results ?? reportsRes.data ?? []);
        setContactMessages(messagesRes.data?.results ?? messagesRes.data ?? []);
        setAlerts(alertsRes.data?.results ?? alertsRes.data ?? []);
      } catch {
        setError("Failed to load dashboard data.");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("phone");
    navigate("/login");
  };

  const locationColors = [
    "rgba(16, 185, 129, 0.85)",
    "rgba(245, 158, 11, 0.85)",
    "rgba(52, 211, 153, 0.85)",
    "rgba(251, 191, 36, 0.85)",
    "rgba(5, 150, 105, 0.85)",
    "rgba(217, 119, 6, 0.85)",
  ];

  const typeColors = [
    "rgba(59, 130, 246, 0.85)",   // low_registration - blue
    "rgba(245, 158, 11, 0.85)",   // intimidation - amber
    "rgba(239, 68, 68, 0.85)",    // violence - red
    "rgba(139, 92, 246, 0.85)",   // bribery - purple
    "rgba(107, 114, 128, 0.85)",  // other - gray
  ];

  const lineData = dashboardData ? {
    labels: dashboardData.reports_by_location.slice(0, 10).map((r) => r.location_name),
    datasets: [{
      label: "Reports per Location",
      data: dashboardData.reports_by_location.slice(0, 10).map((r) => r.count),
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.85)",
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "rgba(16, 185, 129, 0.85)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  } : null;

  const doughnutData = dashboardData ? {
    labels: dashboardData.reports_by_location.slice(0, 6).map((r) => r.location_name),
    datasets: [{
      data: dashboardData.reports_by_location.slice(0, 6).map((r) => r.count),
      backgroundColor: locationColors,
      borderColor: "rgba(255,255,255,0.05)",
      borderWidth: 2,
    }],
  } : null;

  const typeBarData = dashboardData ? {
    labels: dashboardData.reports_by_type.map((r) => TYPE_LABEL_MAP[r.incident_type] ?? r.incident_type),
    datasets: [{
      label: "Reports by Incident Type",
      data: dashboardData.reports_by_type.map((r) => r.count),
      backgroundColor: typeColors,
      borderRadius: 8,
      borderSkipped: false,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "rgba(255,255,255,0.7)", font: { family: "Inter" } } },
      title:  { display: false },
    },
    scales: {
      x: { ticks: { color: "rgba(255,255,255,0.5)" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "rgba(255,255,255,0.5)" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "rgba(255,255,255,0.7)", font: { family: "Inter" }, padding: 14 },
      },
    },
  };

  return (
    <div
      className="dashboard-page"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5,10,20,0.92) 0%, rgba(5,10,20,0.82) 100%), url(${ddayBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <img src={flagIcon} alt="CivicReach" style={{ width: "60%", height: "60%", objectFit: "contain" }} />
          </div>
          <div>
            <div className="dashboard-brand-title">CivicReach Admin</div>
            <div className="dashboard-brand-subtitle">Operations Console</div>
          </div>
        </div>
        <div className="dashboard-actions">
          {/* ✅ Fixed: use Link/navigate instead of <a href> to avoid full reloads */}
          <Link to="/heatmap" className="dashboard-btn cta-btn">🔥 Heatmap</Link>
          <Link to="/report"  className="dashboard-btn cta-btn">+ New Report</Link>
          <button className="dashboard-btn signout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header
          className="dashboard-hero"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(5,10,20,0.75) 0%, rgba(5,20,12,0.68) 100%), url(${voteBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "2rem 2.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <h2>Dashboard</h2>
            <p className="dashboard-subtitle">Overview of all reported incidents and urgent response metrics.</p>
          </div>
          <div className="dashboard-hero-pill">Live</div>
        </header>

        {error && <div className="alert alert-error"><span aria-hidden="true">⚠️</span> {error}</div>}

        {!dashboardData ? (
          <p className="dashboard-loading">Loading dashboard data…</p>
        ) : (
          <>
            {/* Stats row */}
            <section className="dashboard-grid stats-grid">
              <div className="glass-card stat-card">
                <div className="stat-number">{dashboardData.total_reports}</div>
                <div className="stat-label">Total Reports</div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-number">{contactMessages.length}</div>
                <div className="stat-label">Contact Messages</div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-number">{alerts.length}</div>
                <div className="stat-label">Alerts Sent</div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-number">{dashboardData.reports_by_location.length}</div>
                <div className="stat-label">Locations Affected</div>
              </div>
            </section>

            {/* Charts */}
            <section className="dashboard-grid chart-grid">
              <div className="glass-card chart-card">
                <div className="chart-card-header">Reports by Location (Top 10)</div>
                {lineData && <Line data={lineData} options={chartOptions} />}
              </div>
              <div className="glass-card chart-card">
                <div className="chart-card-header">Location Distribution</div>
                {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
              </div>
            </section>

            {/* Incident type breakdown */}
            <section className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="glass-card chart-card">
                <div className="chart-card-header">Reports by Incident Type</div>
                {typeBarData && <Bar data={typeBarData} options={chartOptions} />}
              </div>
            </section>

            {/* Data tables */}
            <section className="dashboard-grid data-grid">
              <div className="glass-card data-card">
                <div className="data-card-header">Recent Reports</div>
                <div className="data-list">
                  {allReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="data-item">
                      <div className="data-item-title">{report.incident_type_display || report.incident_type}</div>
                      <div className="data-item-subtitle">
                        {report.location_name} • {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card data-card">
                <div className="data-card-header">Contact Messages</div>
                <div className="data-list">
                  {contactMessages.slice(0, 5).map((message) => (
                    <div key={message.id} className="data-item">
                      <div className="data-item-title">From: {message.user_phone}</div>
                      <div className="data-item-subtitle">
                        {message.message.length > 50 ? message.message.substring(0, 50) + "…" : message.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card data-card">
                <div className="data-card-header">Recent Alerts</div>
                <div className="data-list">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="data-item">
                      <div className="data-item-title">{alert.title}</div>
                      <div className="data-item-subtitle">{new Date(alert.sent_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

