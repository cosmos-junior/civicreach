import React, { useEffect, useState } from "react";
import { API } from "./api";
import newkadiImage from "./assets/newkadi.jpeg";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, reportsRes, messagesRes, alertsRes] = await Promise.all([
          API.get("/reports/dashboard/"),
          API.get("/reports/all-reports/"),
          API.get("/reports/all-contact-messages/"),
          API.get("/reports/all-alerts/")
        ]);
        setDashboardData(dashboardRes.data);
        setAllReports(reportsRes.data);
        setContactMessages(messagesRes.data);
        setAlerts(alertsRes.data);
      } catch {
        setError("Failed to load dashboard data.");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const colors = [
    "rgba(0, 102, 51, 0.85)",
    "rgba(187, 0, 0, 0.85)",
    "rgba(0, 153, 68, 0.85)",
    "rgba(139, 0, 0, 0.85)",
    "rgba(0, 204, 85, 0.85)",
    "rgba(220, 50, 50, 0.85)",
  ];

  const lineData = dashboardData ? {
    labels: dashboardData.reports_by_location.map((r: any) => r.location_name),
    datasets: [{
      label: "Reports per Location",
      data: dashboardData.reports_by_location.map((r: any) => r.count),
      backgroundColor: "rgba(0, 102, 51, 0.2)",
      borderColor: "rgba(0, 102, 51, 0.85)",
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "rgba(0, 102, 51, 0.85)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  } : null;

  const doughnutData = dashboardData ? {
    labels: dashboardData.reports_by_location.map((r: any) => r.location_name),
    datasets: [{
      data: dashboardData.reports_by_location.map((r: any) => r.count),
      backgroundColor: colors,
      borderColor: "rgba(255,255,255,0.05)",
      borderWidth: 2,
    }],
  } : null;

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "rgba(255,255,255,0.7)", font: { family: "Inter" } } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "rgba(255,255,255,0.6)" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "rgba(255,255,255,0.6)" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const, labels: { color: "rgba(255,255,255,0.7)", font: { family: "Inter" }, padding: 16 } },
    },
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <img src={newkadiImage} alt="CivicReach" />
          </div>
          <div>
            <div className="dashboard-brand-title">CivicReach Admin</div>
            <div className="dashboard-brand-subtitle">Operations Console</div>
          </div>
        </div>
        <div className="dashboard-actions">
          <a href="/report" className="dashboard-btn cta-btn">New Report</a>
          <button className="dashboard-btn signout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="dashboard-hero">
          <div>
            <h2>Dashboard</h2>
            <p className="dashboard-subtitle">Overview of all reported incidents and urgent response metrics.</p>
          </div>
          <div className="dashboard-hero-pill">Live</div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {!dashboardData ? (
          <p className="dashboard-loading">Loading...</p>
        ) : (
          <>
            <section className="dashboard-grid stats-grid">
              <div className="glass-card stat-card">
                <div className="stat-number">{dashboardData?.total_reports || 0}</div>
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
                <div className="stat-number">{dashboardData?.reports_by_location.length || 0}</div>
                <div className="stat-label">Locations Affected</div>
              </div>
            </section>

            <section className="dashboard-grid chart-grid">
              <div className="glass-card chart-card">
                <div className="chart-card-header">Reports by Location</div>
                {lineData && <Line data={lineData} options={lineOptions} />}
              </div>
              <div className="glass-card chart-card">
                <div className="chart-card-header">Distribution</div>
                {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
              </div>
            </section>

            <section className="dashboard-grid data-grid">
              <div className="glass-card data-card">
                <div className="data-card-header">Recent Reports</div>
                <div className="data-list">
                  {allReports.slice(0, 5).map((report: any) => (
                    <div key={report.id} className="data-item">
                      <div className="data-item-title">{report.incident_type}</div>
                      <div className="data-item-subtitle">{report.location_name} • {new Date(report.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card data-card">
                <div className="data-card-header">Contact Messages</div>
                <div className="data-list">
                  {contactMessages.slice(0, 5).map((message: any) => (
                    <div key={message.id} className="data-item">
                      <div className="data-item-title">From: {message.user_phone}</div>
                      <div className="data-item-subtitle">{message.message.substring(0, 50)}...</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card data-card">
                <div className="data-card-header">Recent Alerts</div>
                <div className="data-list">
                  {alerts.slice(0, 5).map((alert: any) => (
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
