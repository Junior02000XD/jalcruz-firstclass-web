import { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext"; // Importamos el contexto del otro archivo

export const AuthProvider = ({ children }) => {
    // Inicialización Perezosa
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return null;
            }
        }
        return null;
    });

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    const isAuthenticated = !!user;

    // Lógica de Roles para Laravel Spatie
    const hasRole = (roleName) => {
        if (!user || !user.roles) return false;
        if (user.roles.includes("Super Admin")) return true;
        return user.roles.includes(roleName);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};