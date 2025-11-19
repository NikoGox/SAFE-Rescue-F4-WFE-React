import { useState, useEffect } from 'react';
import type { UserData } from '../types/PerfilesType'; 

export const useAuth = () => {
    const [authData, setAuthData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!authData;
    const userName = authData?.nombreUsuario || authData?.nombre || '';
    const profileImage = authData?.profileImage; 

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            if (usuarioLogueado) {
                const userData: UserData = JSON.parse(usuarioLogueado); 
                
                setAuthData(userData);
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            logout(); 
        } finally {
            setLoading(false);
        }
    };

    const login = (userData: UserData) => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData)); 
        setAuthData(userData);
    };

    const logout = () => {
        localStorage.removeItem('usuarioLogueado');
        setAuthData(null); 
    };

    return {
        isLoggedIn,
        userName,
        profileImage, 
        authData,     
        login,
        logout,
        loading,
        checkAuthStatus
    };
};