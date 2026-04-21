import React, { useState, useEffect } from "react";
import { API } from "./api";
import { useNavigate } from "react-router-dom";
import flagIcon from "./assets/flag.png";
import mapIcon from "./assets/map.png";
import voteBg from "./assets/votebg.jpg";
import ddayImg from "./assets/dday.jpg";
import "./Home.css";

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "report" | "verify" | "heatmap">("home");
  const [voterStatus, setVoterStatus] = useState<"yes" | "no" | "unsure" | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [form, setForm] = useState({
    location_name: "", county: "", subcounty: "", division: "",
    location: "", sublocation: "", ward: "", latitude: "", longitude: "",
    incident_type: "low_registration", message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [attendanceFeedback, setAttendanceFeedback] = useState<Record<number, string>>({}); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, profileRes] = await Promise.all([
          API.get("/reports/my-reports/"),
          API.get("/users/profile/")
        ]);
        // Handle both paginated {results:[]} and plain array responses
        setReports(reportsRes.data?.results ?? reportsRes.data ?? []);
        setUserProfile(profileRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setReports([]);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    // ✅ Only clear auth keys — preserve accessibility preferences
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("phone");
    navigate("/login");
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() });
        setLocating(false); setSuccess("Location captured!"); setTimeout(() => setSuccess(""), 3000);
      },
      () => { setError("Location denied. Enter manually."); setLocating(false); }
    );
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      await API.post("/reports/create/", {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      setSuccess("Report submitted successfully!");
      setForm({ location_name: "", county: "", subcounty: "", division: "", location: "", sublocation: "", ward: "", latitude: "", longitude: "", incident_type: "low_registration", message: "" });
    } catch { setError("Failed to submit report. Check all fields."); }
    finally { setLoading(false); }
  };

  const contactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    if (!contactMessage.trim()) {
      setContactError("Please enter a message for the admin.");
      return;
    }
    try {
      // ✅ Fixed: use the API endpoint instead of unreliable mailto:
      await API.post("/users/contact/", { message: contactMessage });
      setContactSuccess("Message sent to admin successfully!");
      setContactMessage("");
    } catch {
      setContactError("Failed to send message. Please try again.");
    }
  };

  const submitFeedback = async (reportId: number, status: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setError("");
    setSuccess("");
    try {
      await API.patch(`/reports/${reportId}/feedback/`, { attendance_status: status });
      setAttendanceFeedback(prev => ({ ...prev, [reportId]: status }));
      setSuccess("Attendance feedback saved.");
    } catch {
      setError("Unable to save feedback. Please try again.");
    }
  };

  const mapImg = <img src={mapIcon} alt="map" style={{ width: "16px", height: "16px", objectFit: "contain" }} />;

  return (
    <div
      className="home-bg"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.7) 40%, rgba(5,10,20,0.92) 100%), url(${voteBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <nav className="home-nav">
        <div className="home-brand">
          <img src={flagIcon} alt="flag" style={{ width: "32px", height: "32px", objectFit: "contain", animation: "wave 1.5s ease-in-out infinite", transformOrigin: "left center" }} />
          <span className="home-brand-name">CivicReach</span>
        </div>
        <div className="home-nav-tabs">
          {(["home", "report", "verify", "heatmap"] as const).map(tab => (
            <button key={tab} className={`home-tab ${activeTab === tab ? "active" : ""}`} onClick={() => {
              if (tab === "heatmap") {
                navigate("/heatmap");
              } else {
                setActiveTab(tab);
              }
            }}>
              {tab === "home" ? "Home" : tab === "report" ? "Report" : tab === "verify" ? "Voter Status" : "🔥 Heatmap"}
            </button>
          ))}
        </div>
        <button className="home-logout" onClick={handleLogout}>Sign Out</button>
      </nav>

      <div className="home-content">

        {activeTab === "home" && (
          <>
            <div
              className="welcome-banner"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(5,10,20,0.72) 0%, rgba(5,20,12,0.65) 100%), url(${ddayImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
                borderRadius: "var(--radius-xl)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div className="welcome-text">
                <h2>Welcome back, {userProfile?.full_name || userProfile?.phone || "Citizen"} 👋</h2>
                <p>Logged in as <strong>{userProfile?.admin ? "Admin" : "Citizen Reporter"}</strong></p>
              </div>
              <div className="welcome-emoji">🛡️</div>
            </div>

            <div className="bento-grid">
              <div className="bento-stat" onClick={() => setActiveTab("report")}>
                <div className="bento-stat-number">{reports.length}</div>
                <div className="bento-stat-label">My Reports</div>
              </div>
              <div className="bento-stat" onClick={() => setActiveTab("verify")}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.4rem" }}>🗳️</div>
                <div className="bento-stat-label">Voter Status</div>
              </div>
            </div>

            <div className="g-card contact-card">
              <div className="section-title">Contact Admin</div>
              <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>
                Send a quick message to the admin team if you need help or want to follow up on your report.
              </p>
              {contactError && <div className="alert alert-error">{contactError}</div>}
              {contactSuccess && <div className="alert alert-success">{contactSuccess}</div>}
              <form onSubmit={contactAdmin}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label>Message to Admin</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <textarea
                      placeholder="Describe your issue or ask a question for the admin team..."
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      style={{ minHeight: "110px", paddingTop: "1rem" }}
                    />
                  </div>
                </div>
                <button className="btn-cta" type="submit" style={{ width: "100%", padding: "0.85rem" }}>
                  Send to Admin
                </button>
              </form>
              <div className="contact-details" style={{ marginTop: "1rem", color: "rgba(255,255,255,0.55)", fontSize: "0.92rem" }}>
                <p>Admin email: <a href="mailto:joachimnevilleodhiambo@gmail.com">joachimnevilleodhiambo@gmail.com</a></p>
                <p>Admin phone: <a href="tel:+254716306489">+254 716 306 489</a></p>
              </div>
            </div>

            <div className="g-card">
              <div className="section-title">My Recent Reports</div>
              {reports.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"></div>
                  <p>No reports yet.</p>
                  <button className="btn-cta" style={{ marginTop: "1rem" }} onClick={() => setActiveTab("report")}>
                    + Submit First Report
                  </button>
                </div>
              ) : (
                reports.map((r: any, i: number) => (
                  <div className="report-item" key={i}>
                    <div className="report-item-title">📍 {r.location_name} — {r.county}</div>
                    <div className="report-item-desc">{r.message?.substring(0, 100)}...</div>
                    <div className="report-item-date">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "report" && (
          <div className="g-card" style={{ maxWidth: "680px", margin: "0 auto" }}>
            <h2 style={{ marginBottom: "0.3rem" }}>Report Incident</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Provide details about the incident location</p>
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
              {/* Incident type selector */}
              <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                <label>Incident Type</label>
                <div className="input-wrapper">
                  <span className="input-icon">⚠️</span>
                  <select
                    value={form.incident_type}
                    onChange={e => setForm({ ...form, incident_type: e.target.value })}
                    required
                    style={{ background: "transparent", border: "none", color: "inherit", width: "100%", fontFamily: "var(--font-family)" }}
                  >
                    <option value="low_registration">Low Voter Registration</option>
                    <option value="intimidation">Voter Intimidation</option>
                    <option value="violence">Violence / Disruption</option>
                    <option value="bribery">Vote Buying / Bribery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
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
                <button type="button" className="btn-cta" onClick={getLocation} disabled={locating}>
                  {locating ? "Locating..." : "📍 Get Location"}
                </button>
              </div>
              <div className="form-group">
                <label>Incident Description</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ top: "1.1rem", transform: "none" }}>📝</span>
                  <textarea placeholder="Describe what happened in detail..." value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
              </div>
              <button className="btn-cta" type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", fontSize: "1rem" }}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "verify" && (
          <div className="g-card" style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🗳️</div>
            <h2 style={{ marginBottom: "0.4rem" }}>Voter Registration</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2rem" }}>Are you registered as a voter in Kenya?</p>
            <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
              <button className={`voter-btn ${voterStatus === "yes" ? "selected-yes" : ""}`} onClick={() => setVoterStatus("yes")}>✅ Yes</button>
              <button className={`voter-btn ${voterStatus === "no" ? "selected-no" : ""}`} onClick={() => setVoterStatus("no")}>❌ No</button>
              <button className={`voter-btn ${voterStatus === "unsure" ? "selected-unsure" : ""}`} onClick={() => setVoterStatus("unsure")}>🤔 Not Sure</button>
            </div>
            {voterStatus === "yes" && (
              <div className="alert alert-success">🎉 Great! You are registered. Keep your details up to date on the IEBC portal.</div>
            )}
            {voterStatus === "no" && (
              <div style={{ padding: "1.5rem", background: "rgba(239,68,68,0.08)", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)", textAlign: "left" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>You are not registered. Register on the IEBC portal today.</p>
                <a href="https://verify.iebc.or.ke/" target="_blank" rel="noreferrer" className="iebc-link">🔗 Register on IEBC Portal</a>
              </div>
            )}
            {voterStatus === "unsure" && (
              <div style={{ padding: "1.5rem", background: "rgba(139,92,246,0.08)", borderRadius: "16px", border: "1px solid rgba(139,92,246,0.2)", textAlign: "left" }}>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "0.5rem" }}>Verify your registration using your National ID on the official IEBC portal.</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", marginBottom: "1rem" }}>You will be redirected to the official IEBC website.</p>
                <a href="https://verify.iebc.or.ke/" target="_blank" rel="noreferrer" className="iebc-link">🔍 Check My Voter Status</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with accessibility information */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CivicReach</h4>
            <p>Empowering communities through transparent reporting and civic engagement.</p>
          </div>
          <div className="footer-section">
            <h4>Accessibility</h4>
            <p>
              We are committed to making our platform accessible to everyone.
              Use the accessibility widget (♿) in the bottom-right corner to adjust your experience.
            </p>
            <a href="/accessibility-policy" className="footer-link">
              View Accessibility Policy
            </a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              Email: <a href="mailto:joachimnevilleodhiambo@gmail.com">joachimnevilleodhiambo@gmail.com</a><br />
              Phone: <a href="tel:+254716306489">+254 716 306 489</a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 CivicReach. All rights reserved.</p>
          <div className="footer-links">
            <a href="/accessibility-policy">Accessibility</a>
            <span aria-hidden="true">|</span>
            <a href="mailto:joachimnevilleodhiambo@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
