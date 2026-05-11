import { createContext, useContext } from "react";

// 1. Exportamos el Contexto vacío
export const AuthContext = createContext(null);

// 2. Exportamos el Hook para consumirlo
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};