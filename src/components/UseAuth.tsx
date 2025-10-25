import { useState, useEffect } from 'react';
// 🛑 IMPORTAR EL TIPO UserData
import type { UserData } from '../types/UserType'; 

export const useAuth = () => {
    // 🛑 CAMBIO: Usaremos un solo estado para todos los datos del usuario logueado
    const [authData, setAuthData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Derivados del estado principal
    const isLoggedIn = !!authData;
    const userName = authData?.nombreUsuario || authData?.nombre || '';
    const profileImage = authData?.profileImage; // 🛑 NUEVO: Exponer la imagen

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            if (usuarioLogueado) {
                // 🛑 TIPADO: Parsear como UserData
                const userData: UserData = JSON.parse(usuarioLogueado); 
                
                // 🛑 ESTADO: Almacenar el objeto completo
                setAuthData(userData);
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            // Si hay error, limpia y cierra sesión
            logout(); 
        } finally {
            setLoading(false);
        }
    };

    // La función 'login' recibe el objeto UserData completo
    const login = (userData: UserData) => {
        // Almacena en localStorage (incluye profileImage)
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData)); 
        // 🛑 ESTADO: Almacenar el objeto completo
        setAuthData(userData);
    };

    const logout = () => {
        localStorage.removeItem('usuarioLogueado');
        // 🛑 ESTADO: Limpiar el objeto completo
        setAuthData(null); 
    };

    return {
        isLoggedIn,
        userName,
        profileImage, // 🛑 NUEVO: Devolver la foto de perfil
        authData,     // Opcional: devolver todo el objeto de datos
        login,
        logout,
        loading,
        checkAuthStatus // Opcional, pero útil
    };
};