import React, { useState, useEffect, useRef } from "react";
import { PublicAPI } from "./api";
import { useNavigate, Link } from "react-router-dom";
import kadiImage from "./assets/newkadi.jpeg";
import flagIcon from "./assets/flag.png";
import fingerBg from "./assets/fingerbg.jpg";

export default function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Refs for focus management
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Focus management for error/success announcements
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.focus();
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Announce loading state to screen readers
    const loadingAnnouncement = document.createElement('div');
    loadingAnnouncement.setAttribute('aria-live', 'polite');
    loadingAnnouncement.setAttribute('aria-atomic', 'true');
    loadingAnnouncement.textContent = 'Signing in...';
    document.body.appendChild(loadingAnnouncement);

    try {
      const resp = await PublicAPI.post("/login/", form);
      const token = resp.data.access;
      const refreshToken = resp.data.refresh;
      const payload = JSON.parse(atob(token.split(".")[1]));

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isAdmin", payload.is_staff ? "true" : "false");
      localStorage.setItem("phone", form.phone);

      // Success announcement
      loadingAnnouncement.textContent = 'Login successful. Redirecting...';

      if (payload.is_staff) {
        setIsAdmin(true);
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setTimeout(() => navigate("/home"), 1000);
      }
    } catch {
      setError("Invalid phone number or password.");
      // Focus will move to error message
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (document.body.contains(loadingAnnouncement)) {
          document.body.removeChild(loadingAnnouncement);
        }
      }, 1000);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError("");
  };

  return (
    <div
      className="page login-page"
      role="main"
      aria-label="Login page"
      style={{
        backgroundImage: `url(${fingerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="card login-card" role="region" aria-label="Login form">
        {/* Hero image covering the top */}
        <div className="login-hero-img">
          <img
            src={kadiImage}
            alt="CivicReach - Empowering Community Reporting"
          />
          <div className="overlay" aria-hidden="true" />
          <div className="brand">
            <div
              className="brand-icon"
              role="img"
              aria-label="Kenya flag icon"
            >
              <img
                src={flagIcon}
                alt=""
                style={{
                  animation: "wave 1.5s ease-in-out infinite",
                  transformOrigin: "left center"
                }}
              />
            </div>
            <span className="brand-name">CivicReach</span>
          </div>
        </div>

        <header>
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your account to continue</p>
        </header>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {error && `Error: ${error}`}
          {success && `Success: ${success}`}
          {loading && "Signing in..."}
        </div>

        {error && (
          <div
            ref={errorRef}
            className="alert alert-error"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            <span aria-hidden="true">⚠️</span>
            {error}
          </div>
        )}

        {isAdmin ? (
          <div role="region" aria-label="Admin login successful">
            <div
              className="alert alert-success"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">🎉</span>
              Logged in as Admin
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate("/dashboard")}
                aria-label="Go to admin dashboard"
              >
                📊 View Dashboard
              </button>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => navigate("/report")}
                aria-label="Submit a new incident report"
              >
                📝 Submit Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            <div className="form-group">
              <label htmlFor="phone-input">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">📱</span>
                <input
                  ref={phoneInputRef}
                  id="phone-input"
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={form.phone}
                  onChange={handleInputChange("phone")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "login-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="tel"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password-input">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">🔒</span>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleInputChange("password")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "login-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              aria-describedby={loading ? "loading-status" : undefined}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Hidden loading status for screen readers */}
            {loading && (
              <div id="loading-status" className="sr-only" aria-live="polite">
                Signing in, please wait...
              </div>
            )}
          </form>
        )}

        {!isAdmin && (
          <nav aria-label="Account navigation">
            <p className="link-text">
              Don't have an account?{" "}
              <Link
                to="/register"
                aria-label="Go to registration page to create a new account"
              >
                Register here
              </Link>
            </p>
          </nav>
        )}
      </div>
    </div>
  );
}
