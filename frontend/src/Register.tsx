import React, { useState, useEffect, useRef } from "react";
import { PublicAPI } from "./api";
import { useNavigate, Link } from "react-router-dom";
import newkadiImage from "./assets/newkadi.jpeg";
import regBg from "./assets/regbg.jpg";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", phone: "", id_number: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Refs for focus management
  const fullNameInputRef = useRef<HTMLInputElement>(null);
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
    loadingAnnouncement.textContent = 'Creating account...';
    document.body.appendChild(loadingAnnouncement);

    try {
      await PublicAPI.post("/users/register/", form);
      setSuccess("Account created! Redirecting to login...");
      loadingAnnouncement.textContent = 'Account created successfully. Redirecting to login page...';
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const msg = err.response?.data;
      if (msg) {
        const firstError = Object.values(msg)[0];
        setError(Array.isArray(firstError) ? firstError[0] as string : String(firstError));
      } else {
        setError("Network error. Make sure the server is running.");
      }
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
      className="register-page"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(5, 8, 18, 0.88) 0%, rgba(10, 20, 12, 0.82) 60%, rgba(5, 8, 18, 0.9) 100%), url(${regBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
      role="main"
      aria-label="Registration page"
    >
      <div className="register-layout">
        <div className="register-form-section" role="region" aria-label="Registration form">
          <div className="register-brand">
            <div
              className="register-brand-icon"
              role="img"
              aria-label="CivicReach logo"
            ></div>
            <span className="register-brand-name">CivicReach</span>
          </div>

          <header>
            <h1>Create account</h1>
            <p className="register-subtitle">Passionate about Democracy? Register and start reporting areas with low voter registration</p>
            <p className="register-subtitle" style={{ fontStyle: "italic", color: "var(--color-amber-400)" }}>Je Uko kadi?</p>
          </header>

          {/* Screen reader announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {error && `Error: ${error}`}
            {success && `Success: ${success}`}
            {loading && "Creating account..."}
          </div>

          {error && (
            <div
              ref={errorRef}
              id="register-error"
              className="register-alert register-alert-error"
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
            >
              <span aria-hidden="true">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div
              ref={successRef}
              className="register-alert register-alert-success"
              role="status"
              aria-live="polite"
              tabIndex={-1}
            >
              <span aria-hidden="true">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="register-form" aria-label="Registration form">
            <div className="register-form-group">
              <label htmlFor="full-name-input">Full Name</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon" aria-hidden="true">👤</span>
                <input
                  ref={fullNameInputRef}
                  id="full-name-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleInputChange("full_name")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "register-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="phone-input">Phone Number</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon" aria-hidden="true">📱</span>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={form.phone}
                  onChange={handleInputChange("phone")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "register-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="id-number-input">National ID Number</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon" aria-hidden="true">🆔</span>
                <input
                  id="id-number-input"
                  type="text"
                  placeholder="Enter your ID number"
                  value={form.id_number}
                  onChange={handleInputChange("id_number")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "register-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="password-input">Password</label>
              <div className="register-input-wrapper">
                <span className="register-input-icon" aria-hidden="true">🔒</span>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleInputChange("password")}
                  required
                  aria-required="true"
                  aria-describedby={error ? "register-error" : undefined}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              className="register-btn-cta"
              type="submit"
              disabled={loading}
              aria-describedby={loading ? "register-loading-status" : undefined}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Hidden loading status for screen readers */}
            {loading && (
              <div id="register-loading-status" className="sr-only" aria-live="polite">
                Creating account, please wait...
              </div>
            )}
          </form>

          <nav aria-label="Account navigation">
            <p className="register-link-text">
              Already have an account?{" "}
              <Link
                to="/login"
                aria-label="Go to login page to sign in to existing account"
              >
                Sign in
              </Link>
            </p>
          </nav>
        </div>

        <div className="register-campaign-widget">
          <h2>Why Vote? Your Voice Matters!</h2>
          <p>Voting is the cornerstone of democracy. It empowers you to:</p>
          <ul>
            <li>Elect leaders who represent your interests</li>
            <li>Influence policies that affect your community</li>
            <li>Shape the future of your country</li>
            <li>Hold governments accountable</li>
          </ul>
          <h3>How to Register as a Voter</h3>
          <p>To participate in elections, you need to register with the Independent Electoral and Boundaries Commission (IEBC):</p>
          <ol>
            <li>Visit the IEBC website or nearest office</li>
            <li>Provide your National ID and proof of residence</li>
            <li>Fill out the registration form</li>
            <li>Receive your voter card</li>
          </ol>
          <p>Don't miss your chance to make a difference! Register today and vote in the next election.</p>
        </div>
      </div>
    </div>
  );
}
