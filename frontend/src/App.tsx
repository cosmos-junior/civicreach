import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Report from "./Report";
import Dashboard from "./Dashboard";
import Home from "./Home";
import AccessibilityPolicy from "./AccessibilityPolicy";
import AccessibilityWidget from "./AccessibilityWidget";
import HeatmapView from "./HeatmapView";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/heatmap" element={<HeatmapView />} />
          <Route path="/accessibility-policy" element={<AccessibilityPolicy />} />
        </Routes>
        <AccessibilityWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;