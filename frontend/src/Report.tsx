import React, { useState } from "react";
import { API } from "./api";
import { useNavigate } from "react-router-dom";
import mapIcon from "./assets/map.png";
import flagIcon from "./assets/flag.png";
import regBg from "./assets/regbg.jpg";

export default function Report() {
  const [form, setForm] = useState({
    location_name: "",
    county: "",
    subcounty: "",
    division: "",
    location: "",
    sublocation: "",
    latitude: "",
    longitude: "",
    incident_type: "low_registration",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("phone");
    navigate("/login");
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setLocating(false);
        setSuccess("Location captured successfully!");
        setTimeout(() => setSuccess(""), 3000);
      },
      () => {
        setError("Location access denied. Please enter manually.");
        setLocating(false);
      }
    );
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please login again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!form.latitude || !form.longitude) {
      setError("Latitude and longitude are required. Please use 'Get My Location' or enter manually.");
      setLoading(false);
      return;
    }

    try {
      await API.post("/reports/create/", {
        location_name: form.location_name,
        county: form.county,
        subcounty: form.subcounty,
        division: form.division,
        location: form.location,
        sublocation: form.sublocation,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        message: form.message,
      });
      setSuccess("Report submitted successfully!");
      setForm({
        location_name: "",
        county: "",
        subcounty: "",
        division: "",
        location: "",
        sublocation: "",
        latitude: "",
        longitude: "",
        incident_type: "low_registration",
        message: "",
      });
      // Redirect to home after 2 seconds
      setTimeout(() => navigate("/home"), 2000);
    } catch (err: any) {
      console.error("Error response:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || "Failed to submit report. Please check all fields are filled correctly.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const mapImg = <img src={mapIcon} alt="" style={{ width: "16px", height: "16px", objectFit: "contain" }} />;

  return (
    <>
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <img
              src={flagIcon}
              alt="Kenya flag"
              style={{ animation: "wave 1.5s ease-in-out infinite", transformOrigin: "left center" }}
            />
          </div>
          <span className="brand-name">CivicReach</span>
        </div>
        <div className="nav-links">
          <button
            className="nav-btn"
            onClick={() => navigate("/home")}
          >
            ← Back to Home
          </button>
          <button className="nav-btn btn-danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div
        className="page"
        style={{
          paddingTop: "5.5rem",
          backgroundImage: `linear-gradient(to bottom, rgba(5,10,20,0.88) 0%, rgba(5,15,10,0.82) 100%), url(${regBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="card card-wide">
          <h2 style={{ marginBottom: "0.25rem" }}>Report Incident</h2>
          <p className="subtitle">Provide details about the location and the status report</p>

          {error && <div className="alert alert-error"><span aria-hidden="true">⚠️</span> {error}</div>}
          {success && <div className="alert alert-success"><span aria-hidden="true">✅</span> {success}</div>}

          <form onSubmit={submitReport}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Region / Province</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Central, Nyanza, Western"
                    value={form.location_name}
                    onChange={e => setForm({ ...form, location_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>County</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Kisumu, Kitui, Meru"
                    value={form.county}
                    onChange={e => setForm({ ...form, county: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sub-County</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Kisumu Central"
                    value={form.subcounty}
                    onChange={e => setForm({ ...form, subcounty: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Division</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Kisumu East Division"
                    value={form.division}
                    onChange={e => setForm({ ...form, division: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Kondele"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sub-Location</label>
                <div className="input-wrapper">
                  <span className="input-icon">{mapImg}</span>
                  <input
                    type="text"
                    placeholder="e.g. Kondele West"
                    value={form.sublocation}
                    onChange={e => setForm({ ...form, sublocation: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "end", margin: "1rem 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Latitude</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🌐</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="-1.2921"
                      value={form.latitude}
                      onChange={e => setForm({ ...form, latitude: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Longitude</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🌐</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="36.8219"
                      value={form.longitude}
                      onChange={e => setForm({ ...form, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-cta"
                onClick={getLocation}
                disabled={locating}
                style={{ whiteSpace: "nowrap" }}
              >
                {locating ? "Locating..." : "📍 Get My Location"}
              </button>
            </div>

            <div className="form-group">
              <label>Incident Description</label>
              <div className="input-wrapper" style={{ alignItems: "flex-start" }}>
                <span className="input-icon" style={{ marginTop: "0.2rem" }}>📝</span>
                <textarea
                  placeholder="Describe what happened in detail..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
