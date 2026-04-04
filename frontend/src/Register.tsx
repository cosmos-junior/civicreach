import React, { useState } from "react";
import { API } from "./api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ phone: "", id_number: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/users/register/", form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const msg = err.response?.data;
      if (msg) {
        const firstError = Object.values(msg)[0];
        setError(Array.isArray(firstError) ? firstError[0] as string : String(firstError));
      } else {
        setError("Network error. Make sure the server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">🛡️</div>
          <span className="brand-name">NikoKadi</span>
        </div>

        <h2>Create account</h2>
        <p className="subtitle">Register to start reporting incidents</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
            <label>National ID Number</label>
            <div className="input-wrapper">
              <span className="input-icon">🪪</span>
              <input
                type="text"
                placeholder="Enter your ID number"
                value={form.id_number}
                onChange={e => setForm({ ...form, id_number: e.target.value })}
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
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="link-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
