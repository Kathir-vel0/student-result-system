import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    // Not authenticated: redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role.toUpperCase())) {
    // Authenticated but not authorized for this specific role: redirect to login
    return <Navigate to="/login" replace />;
  }

  // Authorized: render the child nested components via Outlet
  return <Outlet />;
};

export default ProtectedRoute;
