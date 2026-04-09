import React from "react";
import { Link } from "react-router-dom";

export default function AccessibilityPolicy() {
  return (
    <div className="page accessibility-policy-page">
      <div className="card accessibility-policy-card">
        <header>
          <h1>Accessibility Policy</h1>
          <p className="subtitle">CivicReach Accessibility Commitment</p>
        </header>

        <div className="policy-content">
          <section>
            <h2>Our Commitment to Accessibility</h2>
            <p>
              CivicReach is committed to ensuring that our platform is accessible to all users,
              regardless of ability. We strive to comply with the Web Content Accessibility Guidelines
              (WCAG) 2.2 Level AA standards and continuously work to improve the accessibility of our services.
            </p>
          </section>

          <section>
            <h3>Accessibility Features</h3>
            <ul>
              <li>Screen reader compatibility with proper ARIA labels and semantic HTML</li>
              <li>Keyboard navigation support throughout the application</li>
              <li>High contrast mode for improved visibility</li>
              <li>Adjustable font sizes and text spacing</li>
              <li>Alternative text for all images and icons</li>
              <li>Clear focus indicators for interactive elements</li>
              <li>Consistent navigation and page structure</li>
              <li>Form validation with descriptive error messages</li>
            </ul>
          </section>

          <section>
            <h3>Standards Compliance</h3>
            <p>
              CivicReach complies with the following accessibility standards:
            </p>
            <ul>
              <li><strong>WCAG 2.2 Level AA:</strong> Web Content Accessibility Guidelines</li>
              <li><strong>Section 508:</strong> U.S. Federal accessibility standards</li>
              <li><strong>EN 301 549:</strong> European accessibility requirements</li>
              <li><strong>Kenya ICT Accessibility Guidelines:</strong> Local accessibility standards</li>
            </ul>
          </section>

          <section>
            <h3>Supported Assistive Technologies</h3>
            <ul>
              <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Braille displays</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Alternative input devices</li>
              <li>Eye-tracking systems</li>
            </ul>
          </section>

          <section>
            <h3>Feedback and Support</h3>
            <p>
              If you encounter accessibility barriers or have suggestions for improvement,
              please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> accessibility@civicreach.go.ke</li>
              <li><strong>Phone:</strong> +254 700 000 000</li>
              <li><strong>Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM EAT</li>
            </ul>
          </section>

          <section>
            <h3>Accessibility Statement Updates</h3>
            <p>
              This accessibility statement was last updated on April 8, 2026.
              We regularly review and update our accessibility features based on user feedback
              and technological advancements.
            </p>
          </section>

          <section>
            <h3>Legal Compliance</h3>
            <p>
              CivicReach is committed to complying with all applicable accessibility laws and regulations,
              including but not limited to:
            </p>
            <ul>
              <li>Persons with Disabilities Act (Kenya)</li>
              <li>Universal Declaration of Human Rights</li>
              <li>Convention on the Rights of Persons with Disabilities (CRPD)</li>
              <li>Kenya National ICT Policy</li>
            </ul>
          </section>
        </div>

        <nav aria-label="Policy navigation">
          <Link to="/" className="btn" aria-label="Return to home page">
            Return to Home
          </Link>
        </nav>
      </div>
    </div>
  );
}