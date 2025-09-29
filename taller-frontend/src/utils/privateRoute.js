import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, initialLoading, user } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return null; // O un spinner de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificación de roles si se especifican
  if (allowedRoles.length > 0 && 
      !user?.roles?.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;