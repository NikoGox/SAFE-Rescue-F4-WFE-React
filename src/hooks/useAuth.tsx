import { useState, useEffect, useCallback } from 'react';
import type {
    UserData,
    AuthResponseDTO,
    UserUpdateRequest,
    CiudadanoData,
    Bombero
} from '../types/PerfilesType';
import UseAuthService from '../service/services/perfiles/UseAuthService';
import UsuarioService from '../service/services/perfiles/UsuarioService';
import BomberoService from '../service/services/perfiles/BomberoService';
import CiudadanoService from '../service/services/perfiles/CiudadanoService';
import { convertirAUserData } from '../types/PerfilesType';
import { getToken, clearToken, tokenManager } from '../service/clients/PerfilesClient';

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
    restoreSession: (userData: UserData) => void;
    updateProfile: (userData: UserUpdateRequest) => Promise<boolean>;
    refreshProfile: (userId?: number, tipoPerfil?: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [authData, setAuthData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const isLoggedIn = !!authData;
    const userName = authData?.nombre || '';
    const profileImage = authData?.idFoto ? `/api/fotos/${authData.idFoto}` : undefined;

    // Enriquecer datos con tipoPerfil si no lo tiene
    const enrichUserData = useCallback((userData: UserData): UserData => {
        if (!userData.tipoPerfil) {
            // Inferir tipo basado en propiedades disponibles
            if (userData.equipo !== undefined && userData.equipo !== null) {
                userData.tipoPerfil = 'BOMBERO';
            } else {
                userData.tipoPerfil = 'CIUDADANO';
            }
        }
        return userData;
    }, []);

    // Refrescar perfil
    const refreshProfile = useCallback(async (userId?: number, tipoPerfil?: string): Promise<void> => {
        try {
            setLoading(true);

            let finalUserId = userId;
            let finalTipoPerfil = tipoPerfil;

            if (!finalUserId || !finalTipoPerfil) {
                const payload = tokenManager.getTokenPayload();
                finalUserId = payload?.id || payload?.sub || payload?.idUsuario;
                finalTipoPerfil = payload?.tipoUsuario || payload?.tipoPerfil;
            }

            if (!finalUserId) {
                console.log("No se pudo obtener userId para refrescar perfil");
                return;
            }

            console.log("Refrescando perfil - UserId:", finalUserId, "Tipo:", finalTipoPerfil);

            let refreshedUser: UserData;

            if (finalTipoPerfil === 'BOMBERO' || finalTipoPerfil === 'JEFE_COMPANIA') {
                console.log("Obteniendo datos de bombero...");
                refreshedUser = await BomberoService.buscarBomberoPorId(finalUserId) as Bombero;
            } else {
                console.log("Obteniendo datos de ciudadano...");
                refreshedUser = await CiudadanoService.buscarCiudadanoPorId(finalUserId) as CiudadanoData;
            }

            // Enriquecer con tipoPerfil
            refreshedUser = enrichUserData(refreshedUser);

            console.log("Perfil refrescado:", refreshedUser);
            setAuthData(refreshedUser);
            localStorage.setItem('usuarioLogueado', JSON.stringify(refreshedUser));
        } catch (err) {
            console.error("Error al refrescar perfil:", err);
            setError("Error al actualizar datos del perfil.");
        } finally {
            setLoading(false);
        }
    }, [enrichUserData]);

    // Actualizar perfil
    const updateProfile = useCallback(async (userData: UserUpdateRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (!authData) {
                throw new Error("No hay usuario autenticado");
            }

            const tipoPerfil = authData.tipoPerfil || 'CIUDADANO';
            console.log("Actualizando perfil - Tipo:", tipoPerfil);
            console.log("Datos a actualizar:", userData);

            let updatedUser: UserData;

            if (tipoPerfil === 'CIUDADANO') {
                console.log("Llamando CiudadanoService.actualizarCiudadano()");
                updatedUser = await CiudadanoService.actualizarCiudadano(
                    authData.idUsuario,
                    userData as Partial<CiudadanoData>
                ) as CiudadanoData;
            } else if (tipoPerfil === 'BOMBERO' || tipoPerfil === 'JEFE_COMPANIA') {
                console.log("Llamando BomberoService.actualizarBombero()");
                updatedUser = await BomberoService.actualizarBombero(
                    authData.idUsuario,
                    userData as Partial<Bombero>
                ) as Bombero;
            } else {
                console.log("Tipo de perfil desconocido, usando UsuarioService");
                updatedUser = await UsuarioService.actualizarUsuario(
                    authData.idUsuario,
                    userData
                ) as UserData;
            }

            // Enriquecer con tipoPerfil
            updatedUser = enrichUserData(updatedUser);

            console.log("Perfil actualizado:", updatedUser);
            setAuthData(updatedUser);
            localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error al actualizar perfil";
            console.error("Error en updateProfile:", errorMessage);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [authData, enrichUserData]);

    // Verificar estado de autenticación
    const checkAuthStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();

            if (!token || !UseAuthService.isAuthenticated()) {
                clearToken();
                localStorage.removeItem('usuarioLogueado');
                setAuthData(null);
                setIsInitialized(true);
                return;
            }

            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            if (usuarioLogueado) {
                let userData: UserData = JSON.parse(usuarioLogueado);
                // Enriquecer datos al cargar
                userData = enrichUserData(userData);
                setAuthData(userData);
            }

            setIsInitialized(true);
        } catch (error) {
            console.error("Error al verificar autenticación:", error);
            setError("Error al verificar autenticación");
            setIsInitialized(true);
        } finally {
            setLoading(false);
        }
    }, [enrichUserData]);

    useEffect(() => {
        if (!isInitialized) {
            checkAuthStatus();
        }
    }, [isInitialized, checkAuthStatus]);

    // Login
    const login = async (credentials: { correo: string; contrasena: string }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const authResponse: AuthResponseDTO = await UseAuthService.login(credentials);
            let userDataBase: UserData = convertirAUserData(authResponse);

            // Enriquecer datos al login
            userDataBase = enrichUserData(userDataBase);

            localStorage.setItem('usuarioLogueado', JSON.stringify(userDataBase));
            setAuthData(userDataBase);

            // Refrescar con parámetros
            await refreshProfile(userDataBase.idUsuario, userDataBase.tipoPerfil);

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error de autenticación";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = () => {
        try {
            clearToken();
            localStorage.removeItem('usuarioLogueado');
            setAuthData(null);
            setError(null);
            setIsInitialized(false);

            UseAuthService.logout().catch(console.error);
        } catch (error) {
            console.error("Error durante logout:", error);
            setError("Error durante el cierre de sesión");
        }
    };

    // Registro
    const register = async (userData: any): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await UseAuthService.register(userData);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error de registro";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const restoreSession = (userData: UserData) => {
        userData = enrichUserData(userData);
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
        restoreSession,
        updateProfile,
        refreshProfile
    };
};