// src/context/AuthContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../components/UseAuth'; // 🛑 AJUSTA LA RUTA a donde está tu hook useAuth
import type { AuthContextType } from '../types/UserType'; // 🛑 Importa el tipo AuthContextType

// 1. Crear el Contexto con un valor inicial indefinido
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Proveedor (Provider)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 🛑 Llama a tu hook useAuth (el que me proporcionaste)
    const auth = useAuth();

    // Mientras los datos se cargan del localStorage, puedes mostrar un loader
    if (auth.loading) {
        return <div>Cargando sesión...</div>; 
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Hook Personalizado para Consumir el Contexto (el que usarás)
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
    }

    return context;
};

// 💡 Alias para que puedas usarlo como 'useAuth' en tus componentes
export { useAuthContext as useAuth };