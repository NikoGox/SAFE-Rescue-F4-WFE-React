// src/services/AuthBomberoService.ts

import {
  type UserRegistroType, // Para la petición de registro
  type UserData,        // Para los datos del usuario logueado
  type TipoUsuario,      
} from '../../../types/PerfilesType.ts';  

import axios, { type AxiosResponse } from 'axios';

// Interfaces mínimas de DTOs del backend que no están en PerfilesType
export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface AuthResponse {
    token: string;
    // El backend devuelve Usuario (que es la entidad base de Ciudadano/Bombero)
    userData: UserData; 
}


// URL base de tu API de Perfiles de Spring Boot
const API_BASE_URL = 'http://localhost:8080/api-perfiles/v1/auth';

/**
 * Gestiona la autenticación y el registro de usuarios (Bomberos y Ciudadanos).
 */
export const AuthBomberoService = {
  
  // ==========================================================
  // AUTENTICACIÓN
  // ==========================================================
  
  /**
   * Autentica un usuario.
   * @param loginData Objeto que contiene nombreUsuario y contrasena.
   * @returns Promesa con el token JWT y los datos del usuario (UserData).
   */
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    const url = `${API_BASE_URL}/login`;
    
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(url, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // ⭐ Guardar datos de autenticación en localStorage
      AuthBomberoService.saveAuthData(response.data.token, response.data.userData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==========================================================
  // REGISTRO
  // ==========================================================

  /**
   * Crea el cuerpo de la petición de registro para el backend.
   * @param formValues Los datos del formulario (UserRegistroType).
   * @param tipoUsuario El objeto TipoUsuario a asignar (ej: BOMBERO o CIUDADANO).
   * @returns El objeto Usuario que el backend espera.
   */
  buildRegistroBody: (formValues: UserRegistroType, tipoUsuario: TipoUsuario): any => {
    // NOTA: El backend de Spring Boot espera la entidad Usuario (con todos sus campos).
    // Debemos mapear UserRegistroType a la estructura de la entidad Usuario.
    
    // Necesitas ajustar esto para que coincida con los campos exactos de tu entidad Usuario de Spring
    const [run, dv] = formValues.rut.split('-'); // Asumiendo formato RUN-DV
    
    const usuarioParaBackend = {
        // Campos de PerfilesType.BaseFields
        nombre: formValues.nombre,
        correo: formValues.email, // Correo es 'email' en el front
        telefono: formValues.telefono,

        // Campos de UserRegistroType
        run: run,
        dv: dv,
        contrasenia: formValues.contrasena, // CUIDADO: La entidad Usuario debe tener 'contrasenia'
        
        // Asumiendo que tu backend también espera estos campos de la entidad Usuario
        idEstado: 1, // Ejemplo: Estado activo
        fechaRegistro: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato "yyyy-MM-dd HH:mm:ss"
        
        // Tipo de Usuario
        tipoUsuario: tipoUsuario,
        
        // La dirección se enviará como parte del cuerpo si la API lo permite, 
        // o debe ser enviada a un endpoint separado.
        // Si tu API de registro es simple (solo Usuario sin Dirección):
        // Debes omitir los campos de dirección (calle, numeroDireccion, idComuna) aquí.
        // Si tu API espera la dirección anidada: NECESITAS UN CAMPO Dirección
        // dirección: { calle: formValues.calle, numero: formValues.numeroDireccion, ... }
        
        // Si tienes campos de A.Paterno y A.Materno en la entidad Usuario (como se vio en el test), ¡debes incluirlos!
        // aPaterno: "...",
        // aMaterno: "...",
    };
    
    return usuarioParaBackend;
  },


  /**
   * Registra un nuevo Bombero.
   * @param formValues Los datos completos del formulario de registro.
   * @returns Promesa con el Usuario creado (UserData).
   */
  registerBombero: async (formValues: UserRegistroType): Promise<UserData> => {
    
    const BOMBERO_TIPO: TipoUsuario = {
        idTipoUsuario: 2, // ⭐ ID asumido para BOMBERO
        nombre: 'BOMBERO',
        permisos: [], 
    };

    const registroBody = AuthBomberoService.buildRegistroBody(formValues, BOMBERO_TIPO);

    const url = `${API_BASE_URL}/register`;
    
    try {
      const response: AxiosResponse<UserData> = await axios.post(url, registroBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },

  // ==========================================================
  // FUNCIONES DE UTILIDAD
  // ==========================================================

  /**
   * Guarda el token y los datos del usuario en el almacenamiento local.
   */
  saveAuthData: (token: string, userData: UserData): void => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  },
  
  /**
   * Elimina los datos de autenticación del almacenamiento local.
   */
  clearAuthData: (): void => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  },
};