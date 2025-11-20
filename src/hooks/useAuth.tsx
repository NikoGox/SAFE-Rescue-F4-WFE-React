// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { UserData, AuthResponseDTO } from '../types/PerfilesType'; 
import UseAuthService from '../service/services/perfiles/UseAuthService';
import { convertirAUserData } from '../types/PerfilesType';
import { getToken, clearToken } from '../service/clients/PerfilesClient';

interface UseAuthReturn {
  isLoggedIn: boolean;
  userName: string;
  profileImage: string | undefined;
  authData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { correo: string; contrasena: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => void;
  clearError: () => void;
  // Método adicional para restaurar sesión sin credenciales
  restoreSession: (userData: UserData) => void;
}

export const useAuth = (): UseAuthReturn => {
    const [authData, setAuthData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = !!authData;
    const userName = authData?.nombre || '';
    const profileImage = authData?.idFoto ? `/api/fotos/${authData.idFoto}` : undefined;

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = getToken();
            
            if (!token) {
                setAuthData(null);
                return;
            }

            // Verificar si el token es válido
            if (!UseAuthService.isAuthenticated()) {
                clearToken();
                setAuthData(null);
                return;
            }

            // Si tenemos token válido pero no tenemos userData, intentar obtener del localStorage
            if (!authData) {
                const usuarioLogueado = localStorage.getItem('usuarioLogueado');
                if (usuarioLogueado) {
                    const userData: UserData = JSON.parse(usuarioLogueado); 
                    setAuthData(userData);
                }
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            setError('Error al verificar autenticación');
            logout(); 
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: { correo: string; contrasena: string }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            
            const authResponse: AuthResponseDTO = await UseAuthService.login(credentials);
            const userData: UserData = convertirAUserData(authResponse);
            
            // Guardar en localStorage para persistencia
            localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
            setAuthData(userData);
            
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            
            await UseAuthService.register(userData);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error de registro';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            // Limpiar token JWT
            clearToken();
            // Limpiar datos locales
            localStorage.removeItem('usuarioLogueado');
            setAuthData(null);
            setError(null);
            
            // Opcional: llamar al logout del servidor
            UseAuthService.logout().catch(console.error);
        } catch (error) {
            console.error('Error durante logout:', error);
            setError('Error durante el cierre de sesión');
        }
    };

    const restoreSession = (userData: UserData) => {
        setAuthData(userData);
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
    };

    const clearError = () => {
        setError(null);
    };

    return {
        isLoggedIn,
        userName,
        profileImage, 
        authData,     
        loading,
        error,
        login,
        register,
        logout,
        checkAuthStatus,
        clearError,
        restoreSession
    };
};