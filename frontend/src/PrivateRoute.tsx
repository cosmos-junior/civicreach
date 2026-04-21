import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

/**
 * Wraps a route so it requires a valid auth token.
 * If adminOnly is true, also checks the isAdmin flag.
 * Redirects to /login if unauthenticated.
 */
export default function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps): React.ReactElement {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
