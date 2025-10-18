///useAuth.tsx
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            if (usuarioLogueado) {
                const userData = JSON.parse(usuarioLogueado);
                setIsLoggedIn(true);
                setUserName(userData.nombre || userData.nombreUsuario);
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData: any) => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUserName(userData.nombre || userData.nombreUsuario);
    };

    const logout = () => {
        localStorage.removeItem('usuarioLogueado');
        setIsLoggedIn(false);
        setUserName("");
    };

    return {
        isLoggedIn,
        userName,
        login,
        logout,
        loading,
        checkAuthStatus
    };
};