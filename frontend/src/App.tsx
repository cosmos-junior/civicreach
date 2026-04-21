import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Report from "./Report";
import Dashboard from "./Dashboard";
import Home from "./Home";
import AccessibilityPolicy from "./AccessibilityPolicy";
import AccessibilityWidget from "./AccessibilityWidget";
import HeatmapView from "./HeatmapView";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./NotFound";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accessibility-policy" element={<AccessibilityPolicy />} />

          {/* Authenticated user routes */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
          <Route path="/heatmap" element={<PrivateRoute><HeatmapView /></PrivateRoute>} />

          {/* Admin-only routes */}
          <Route path="/dashboard" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AccessibilityWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;