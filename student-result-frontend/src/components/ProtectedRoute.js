import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/** Dashboard path for each role (used when authenticated but wrong route). */
function homeForRole(role) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

function normalizeRole(role) {
  return role ? String(role).trim().toUpperCase() : "";
}

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = normalizeRole(localStorage.getItem("role"));

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const allowed = allowedRoles.map((r) => String(r).trim().toUpperCase());
    if (!allowed.includes(role)) {
      // Authenticated but wrong role — send to their dashboard, not login
      return <Navigate to={homeForRole(role)} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
