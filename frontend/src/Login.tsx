import React, { useState } from "react";
import { API } from "./api";
import { useNavigate, Link } from "react-router-dom";
import kadiImage from "./assets/kadi.jpeg";
import flagIcon from "./assets/flag.png";

export default function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await API.post("/login/", form);
      const token = resp.data.access;
      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", payload.is_staff ? "true" : "false");

      if (payload.is_staff) {
        setIsAdmin(true);
      } else {
        navigate("/report");
      }
    } catch {
      setError("Invalid phone number or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">

        {/* kadi.jpeg covering the top of the card */}
        <div style={{
          margin: "-2.5rem -2.5rem 1.5rem -2.5rem",
          height: "160px",
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          position: "relative",
        }}>
          <img src={kadiImage} alt="kadi" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,31,18,0.9))" }} />
          <div className="brand" style={{ position: "absolute", bottom: "1rem", left: "1.5rem", marginBottom: 0 }}>
            <div className="brand-icon" style={{ background: "none", padding: 0, overflow: "visible" }}>
              <img src={flagIcon} alt="flag" style={{ width: "36px", height: "36px", objectFit: "contain", animation: "wave 1.5s ease-in-out infinite", transformOrigin: "left center" }} />
            </div>
            <span className="brand-name">NikoKadi</span>
          </div>
        </div>

        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        {isAdmin ? (
          <div style={{ textAlign: "center" }}>
            <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
              Logged in as Admin 🎉
            </div>
            <button className="btn" onClick={() => navigate("/dashboard")}>
              📊 View Dashboard
            </button>
            <button
              className="btn"
              onClick={() => navigate("/report")}
              style={{ marginTop: "0.8rem", background: "rgba(255,255,255,0.08)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              📝 Submit Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {!isAdmin && (
          <p className="link-text">
            Don't have an account? <Link to="/">Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
