import React, { useState, useEffect } from "react";

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');

    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }

    if (savedHighContrast === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    if (savedReducedMotion === 'true') {
      setReducedMotion(true);
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
  }, []);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.removeItem('accessibility-font-size');
  };

  const toggleHighContrast = () => {
    const newHighContrast = !highContrast;
    setHighContrast(newHighContrast);

    if (newHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('accessibility-high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.removeItem('accessibility-high-contrast');
    }
  };

  const toggleReducedMotion = () => {
    const newReducedMotion = !reducedMotion;
    setReducedMotion(newReducedMotion);

    if (newReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      localStorage.setItem('accessibility-reduced-motion', 'true');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      localStorage.removeItem('accessibility-reduced-motion');
    }
  };

  const resetAllSettings = () => {
    // Reset font size
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.removeItem('accessibility-font-size');

    // Reset high contrast
    setHighContrast(false);
    document.documentElement.classList.remove('high-contrast');
    localStorage.removeItem('accessibility-high-contrast');

    // Reset reduced motion
    setReducedMotion(false);
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    localStorage.removeItem('accessibility-reduced-motion');
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        className="accessibility-toggle"
        onClick={toggleWidget}
        aria-label="Open accessibility options"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true">♿</span>
        <span className="sr-only">Accessibility Options</span>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="accessibility-panel" role="dialog" aria-label="Accessibility settings">
          <div className="accessibility-header">
            <h3>Accessibility Options</h3>
            <button
              className="accessibility-close"
              onClick={toggleWidget}
              aria-label="Close accessibility options"
            >
              ×
            </button>
          </div>

          <div className="accessibility-content">
            <div className="accessibility-section">
              <h4>Font Size</h4>
              <div className="font-controls">
                <button
                  onClick={decreaseFontSize}
                  aria-label="Decrease font size"
                  disabled={fontSize <= 80}
                >
                  A-
                </button>
                <span className="font-size-display">{fontSize}%</span>
                <button
                  onClick={increaseFontSize}
                  aria-label="Increase font size"
                  disabled={fontSize >= 150}
                >
                  A+
                </button>
                <button
                  onClick={resetFontSize}
                  aria-label="Reset font size to default"
                  className="reset-btn"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="accessibility-section">
              <h4>Display Options</h4>
              <div className="display-controls">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    aria-describedby="high-contrast-desc"
                  />
                  <span className="toggle-switch"></span>
                  High Contrast
                </label>
                <div id="high-contrast-desc" className="sr-only">
                  Toggle high contrast mode for better visibility
                </div>

                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={toggleReducedMotion}
                    aria-describedby="reduced-motion-desc"
                  />
                  <span className="toggle-switch"></span>
                  Reduce Motion
                </label>
                <div id="reduced-motion-desc" className="sr-only">
                  Reduce animations and transitions for comfort
                </div>
              </div>
            </div>

            <div className="accessibility-section">
              <h4>Quick Actions</h4>
              <div className="quick-actions">
                <button
                  onClick={resetAllSettings}
                  className="reset-all-btn"
                  aria-label="Reset all accessibility settings to default"
                >
                  Reset All Settings
                </button>
                <a
                  href="/accessibility-policy"
                  className="policy-link"
                  aria-label="View our accessibility policy"
                >
                  Accessibility Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="accessibility-overlay"
          onClick={toggleWidget}
          aria-hidden="true"
        />
      )}
    </>
  );
}