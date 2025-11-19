// src/services/AuthService.ts

import axios from 'axios';

// Usamos los nombres corregidos

import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx';

import { type UserData, type UserRegistroType } from '../../../types/PerfilesType.ts';



// --- Tipos internos para el servicio de autenticación ---



/**

 * Interfaz para el cuerpo de la solicitud de Login.

 */

export interface LoginRequest {

    nombreUsuario: string; // O el campo que uses para identificar al usuario

    contrasena: string;

}



/**

 * Interfaz para la respuesta de una autenticación exitosa.

 * Es crucial que incluya el token para futuras peticiones.

 */

export interface AuthTokenResponse {

    token: string;

    // Opcional: El backend puede devolver el objeto UserData completo aquí

    userData: UserData;

}





// --------------------------------------------------------------------------------

// FUNCIONES DEL SERVICIO DE AUTENTICACIÓN

// --------------------------------------------------------------------------------



/**

 * Realiza el proceso de inicio de sesión contra el backend.

 * @param credentials El nombre de usuario/email y la contraseña.

 * @returns Una promesa que resuelve con la respuesta de autenticación (Token y UserData).

 */

export const loginUser = async (credentials: LoginRequest): Promise<AuthTokenResponse> => {

    // Asumimos que el endpoint de login es /auth/login

    const path = `${PerfilesEndpoints.AUTH}/login`;

    try {

        const response = await perfilesClient.post<AuthTokenResponse>(path, credentials);

        console.log("Login exitoso. Token recibido.");

        return response.data;

    } catch (error) {

        if (axios.isAxiosError(error) && error.response?.status === 401) {

            console.error(`[AuthService] Credenciales inválidas.`, error.response?.data);

        } else if (axios.isAxiosError(error)) {

            console.error(`[AuthService] Error al intentar iniciar sesión: ${error.message}`, error.response?.data);

        }

        // Propagamos el error para que el componente de la UI lo maneje (ej: mostrar mensaje de error)

        throw error;

    }

};



/**

 * Realiza el proceso de registro de un nuevo usuario.

 * @param registrationData Los datos completos del nuevo usuario (incluida la contraseña y los detalles de dirección).

 * @returns Una promesa que resuelve con el objeto UserData del usuario recién creado.

 */

export const registerUser = async (registrationData: UserRegistroType): Promise<UserData> => {

    // Asumimos que el endpoint de registro es /auth/register

    const path = `${PerfilesEndpoints.AUTH}/register`;

    try {

        // NOTA: El backend debe manejar la creación de la entidad Bombero/Ciudadano

        // basado en un campo adicional o la lógica interna.

        const response = await perfilesClient.post<UserData>(path, registrationData);

        console.log("Registro de usuario exitoso.", response.data.nombreUsuario);

        return response.data;

    } catch (error) {

        if (axios.isAxiosError(error)) {

            // Error común: 409 Conflict si el RUT/Email ya existe

            console.error(`[AuthService] Error al registrar usuario: ${error.message}`, error.response?.data);

        }

        throw error;

    }

};



/**

 * Realiza el proceso de cierre de sesión.

 * En APIs modernas, esto suele ser solo una limpieza del token en el cliente.

 * Si el backend necesita ser notificado, se puede implementar aquí.

 */

export const logoutUserBackend = async (): Promise<void> => {

    // Endpoint opcional para invalidar el token en el servidor (ej: /auth/logout)

    const path = `${PerfilesEndpoints.AUTH}/logout`;

    try {

        await perfilesClient.post(path);

        console.log("Notificación de logout al backend exitosa.");

    } catch (error) {

        // El error de logout suele ser ignorado si el cliente ya eliminó el token

        console.warn("[AuthService] Error al notificar logout al backend (se ignora si el token local ya fue eliminado):", error);

    }

};