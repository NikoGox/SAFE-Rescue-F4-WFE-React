
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './UseAuth'; 
import type { AuthContextType } from '../types/PerfilesType'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    if (auth.loading) {
        return <div>Cargando sesión...</div>; 
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
    }

    return context;
};

export { useAuthContext as useAuth };