import React from "react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a href="/home" className="not-found-btn">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
