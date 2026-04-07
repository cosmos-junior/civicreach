import React, { useState, useEffect } from "react";
import { API } from "./api";
import { useNavigate } from "react-router-dom";
import flagIcon from "./assets/flag.png";
import mapIcon from "./assets/map.png";

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "report" | "verify">("home");
  const [voterStatus, setVoterStatus] = useState<"yes" | "no" | "unsure" | null>(null);
  const [form, setForm] = useState({
    location_name: "", county: "", subcounty: "", division: "",
    location: "", sublocation: "", ward: "", latitude: "", longitude: "", message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  const phone = localStorage.getItem("phone") || "User";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports/my-reports/");
        setReports(res.data);
      } catch {
        setReports([]);
      }
    };
    fetchReports();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() });
        setLocating(false);
        setSuccess("Location captured!");
        setTimeout(() => setSuccess(""), 3000);
      },
      () => { setError("Location denied. Enter manually."); setLocating(false); }
    );
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await API.post("/reports/create/", form);
      setSuccess("Report submitted successfully!");
      setForm({ location_name: "", county: "", subcounty: "", division: "", location: "", sublocation: "", ward: "", latitude: "", longitude: "", message: "" });
    } catch { setError("Failed to submit report."); }
    finally { setLoading(false); }
  };

  const mapImg = <img src={mapIcon} alt="map" style={{ width: "16px", height: "16px", objectFit: "contain" }} />;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar" style={{ backgroundImage: "url('/kadi.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="brand">
          <div className="brand-icon" style={{ background: "none", padding: 0, overflow: "visible" }}>
            <img src={flagIcon} alt="flag" style={{ width: "36px", height: "36px", objectFit: "contain", animation: "wave 1.5s ease-in-out infinite", transformOrigin: "left center" }} />
          </div>
          <span className="brand-name">NikoKadi</span>
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === "home" ? "nav-btn-primary" : ""}`} onClick={() => setActiveTab("home")}>🏠 Home</button>
          <button className={`nav-btn ${activeTab === "report" ? "nav-btn-primary" : ""}`} onClick={() => setActiveTab("report")}>📝 Report</button>
          <button className={`nav-btn ${activeTab === "verify" ? "nav-btn-primary" : ""}`} onClick={() => setActiveTab("verify")}>✅ Voter Status</button>
          <button className="nav-btn btn-danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div style={{ paddingTop: "5rem", minHeight: "100vh", padding: "5rem 2rem 2rem" }}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="card" style={{ marginBottom: "1.5rem", padding: "2rem" }}>
              <h2 style={{ marginBottom: "0.3rem" }}>Welcome back 👋</h2>
              <p className="subtitle" style={{ marginBottom: 0 }}>Phone: {phone}</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, background: "linear-gradient(135deg, #006633, #009944)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {reports.length}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.3rem" }}>My Reports</div>
              </div>
              <div className="card" style={{ padding: "1.5rem", textAlign: "center", cursor: "pointer" }} onClick={() => setActiveTab("verify")}>
                <div style={{ fontSize: "2.5rem" }}>🗳️</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "0.3rem" }}>Voter Status</div>
              </div>
            </div>

            {/* My Reports */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>My Recent Reports</h3>
              {reports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                  <p>No reports yet. <button onClick={() => setActiveTab("report")} style={{ background: "none", border: "none", color: "#00cc55", cursor: "pointer", fontFamily: "Inter", fontSize: "0.9rem" }}>Submit one</button></p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {reports.map((r: any, i: number) => (
                    <div key={i} style={{ padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(0,102,51,0.2)" }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>📍 {r.location_name} — {r.county}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{r.message?.substring(0, 100)}...</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: "0.4rem" }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="card card-wide" style={{ maxWidth: "640px", margin: "0 auto" }}>
            <h2>Report Incident</h2>
            <p className="subtitle">Provide details about the incident location</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={submitReport}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { label: "Region / Province", key: "location_name", placeholder: "e.g. Nyanza" },
                  { label: "County", key: "county", placeholder: "e.g. Kisumu" },
                  { label: "Sub-County", key: "subcounty", placeholder: "e.g. Kisumu Central" },
                  { label: "Division", key: "division", placeholder: "e.g. Kisumu East" },
                  { label: "Location", key: "location", placeholder: "e.g. Kondele" },
                  { label: "Sub-Location", key: "sublocation", placeholder: "e.g. Kondele West" },
                  { label: "Ward", key: "ward", placeholder: "e.g. Kondele Ward" },
                ].map(({ label, key, placeholder }) => (
                  <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                    <label>{label}</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{mapImg}</span>
                      <input type="text" placeholder={placeholder} value={(form as any)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "end", margin: "1rem 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Latitude</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🌐</span>
                      <input type="number" step="any" placeholder="-1.2921" value={form.latitude}
                        onChange={e => setForm({ ...form, latitude: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Longitude</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🌐</span>
                      <input type="number" step="any" placeholder="36.8219" value={form.longitude}
                        onChange={e => setForm({ ...form, longitude: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <button type="button" className="btn" onClick={getLocation} disabled={locating}
                  style={{ width: "auto", padding: "0.75rem 1.2rem", marginTop: 0 }}>
                  {locating ? "Locating..." : "📍 Get Location"}
                </button>
              </div>

              <div className="form-group">
                <label>Incident Description</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ top: "1.1rem", transform: "none" }}>📝</span>
                  <textarea placeholder="Describe what happened..." value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
              </div>

              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "🚨 Submit Report"}
              </button>
            </form>
          </div>
        )}

        {/* VOTER VERIFICATION TAB */}
        {activeTab === "verify" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗳️</div>
              <h2 style={{ marginBottom: "0.4rem" }}>Voter Registration Status</h2>
              <p className="subtitle">Are you registered as a voter in Kenya?</p>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", margin: "1.5rem 0" }}>
                {[
                  { value: "yes", label: " Yes", color: "rgba(0,102,51,0.3)", border: "#006633" },
                  { value: "no", label: "No", color: "rgba(187,0,0,0.3)", border: "#BB0000" },
                  { value: "unsure", label: "Not Sure", color: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)" },
                ].map(({ value, label, color, border }) => (
                  <button key={value} onClick={() => setVoterStatus(value as any)}
                    style={{
                      padding: "0.8rem 1.2rem", borderRadius: "12px", border: `2px solid ${voterStatus === value ? border : "rgba(255,255,255,0.1)"}`,
                      background: voterStatus === value ? color : "transparent", color: "#fff",
                      cursor: "pointer", fontFamily: "Inter", fontWeight: 600, fontSize: "0.9rem",
                      transition: "all 0.2s",
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {voterStatus === "yes" && (
                <div className="alert alert-success">
                  Great! You are registered. Make sure your details are up to date on the IEBC portal.
                </div>
              )}

              {voterStatus === "no" && (
                <div className="alert alert-error" style={{ textAlign: "left" }}>
                  You are not registered. Voter registration is important — visit the IEBC portal to register.
                  <br /><br />
                  <a href="https://verify.iebc.or.ke/" target="_blank" rel="noreferrer"
                    style={{ color: "#ffaaaa", fontWeight: 600 }}>
                    🔗 Visit IEBC Website →
                  </a>
                </div>
              )}

              {voterStatus === "unsure" && (
                <div style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.7)" }}>
                    You can verify your voter registration status on the official IEBC portal using your National ID number.
                  </p>
                  <a href="https://verify.iebc.or.ke/" target="_blank" rel="noreferrer"
                    style={{
                      display: "inline-block", padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #006633, #009944)",
                      borderRadius: "10px", color: "#fff", textDecoration: "none",
                      fontWeight: 600, fontSize: "0.95rem",
                    }}>
                    🔍 Check My Voter Status
                  </a>
                  <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
                    You will be redirected to the official IEBC website
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
