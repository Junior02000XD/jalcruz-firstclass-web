import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isAuthenticated, hasRole } = useAuth();
    const location = useLocation();

    // 1. Si no está logueado, patada al Login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user) return null; // Spinner de carga si es necesario

    // 2. Si la ruta requiere un rol específico y el usuario no lo tiene, patada al Dashboard
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};