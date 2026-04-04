import React, { useEffect, useState } from "react";
import { API } from "./api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/reports/dashboard/");
        setData(res.data);
      } catch {
        setError("Failed to load dashboard data.");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  const barData = data ? {
    labels: data.reports_by_location.map((r: any) => r.location_name),
    datasets: [{
      label: "Reports per Location",
      data: data.reports_by_location.map((r: any) => r.count),
      backgroundColor: colors,
      borderColor: colors.map(c => c.replace("0.8", "1")),
      borderWidth: 1,
      borderRadius: 8,
    }],
  } : null;

  const doughnutData = data ? {
    labels: data.reports_by_location.map((r: any) => r.location_name),
    datasets: [{
      data: data.reports_by_location.map((r: any) => r.count),
      backgroundColor: colors,
      borderColor: "rgba(255,255,255,0.05)",
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = {
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
    <>
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">🛡️</div>
          <span className="brand-name">NikoKadi</span>
        </div>
        <div className="nav-links">
          <a href="/report" className="nav-btn">New Report</a>
          <button className="nav-btn btn-danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div style={{ paddingTop: "5rem", minHeight: "100vh", padding: "5rem 2rem 2rem" }}>
        <h2 style={{ marginBottom: "0.4rem" }}>Dashboard</h2>
        <p className="subtitle">Overview of all reported incidents</p>

        {error && <div className="alert alert-error">{error}</div>}

        {!data ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, background: "linear-gradient(135deg, #667eea, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {data.total_reports}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.3rem" }}>Total Reports</div>
              </div>
              <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, background: "linear-gradient(135deg, #f43f5e, #e11d48)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {data.reports_by_location.length}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.3rem" }}>Locations Affected</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "rgba(255,255,255,0.8)" }}>Reports by Location</h3>
                {barData && <Bar data={barData} options={chartOptions} />}
              </div>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "rgba(255,255,255,0.8)" }}>Distribution</h3>
                {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
