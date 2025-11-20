// contexts/AuthContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { usePersistencia } from '../hooks/usePersistencia';
import type { AuthContextType, UserData } from '../types/PerfilesType'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
    const auth = useAuth();
    const { guardarDato, obtenerDato } = usePersistencia();

    // Persistir datos de autenticación cuando cambien
    useEffect(() => {
        if (auth.authData) {
            guardarDato('auth', {
                usuario: auth.authData,
                timestamp: new Date().toISOString()
            });
        }
    }, [auth.authData, guardarDato]);

    // Cargar datos persistidos al inicializar
    useEffect(() => {
        const datosPersistidos = obtenerDato<{ usuario: UserData }>('auth');
        if (datosPersistidos && !auth.authData && auth.restoreSession) {
            // Usar restoreSession en lugar de login
            auth.restoreSession(datosPersistidos.usuario);
        }
    }, [auth, obtenerDato]);

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