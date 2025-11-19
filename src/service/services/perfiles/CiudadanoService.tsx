// src/services/CiudadanoService.ts 

import axios, { type AxiosResponse } from 'axios';
import {
  type UserRegistroType,
  type UserData,
  type TipoUsuario,
  type LoginRequest, // Requerida para la función de login si la incluyes aquí
} from '../../../types/PerfilesType.ts';  // ⭐ Usamos los tipos de tu archivo PerfilesType

// La URL base y las utilidades de construcción del cuerpo son reutilizadas

// URL base de tu API de Perfiles de Spring Boot
const API_BASE_URL = 'http://localhost:8080/api-perfiles/v1/auth';
const REGISTER_URL = `${API_BASE_URL}/register`;

// Definición del tipo de usuario Ciudadano
const CIUDADANO_TIPO: TipoUsuario = {
    idTipoUsuario: 1, // ⭐ ID asumido para CIUDADANO
    nombre: 'CIUDADANO',
    permisos: [], 
};

/**
 * Función de utilidad para construir el cuerpo de la petición de registro, 
 * replicando la lógica de tu AuthService.
 */
const buildRegistroBody = (formValues: UserRegistroType, tipoUsuario: TipoUsuario): any => {
    
    // Asumiendo formato RUN-DV
    const [run, dv] = formValues.rut.split('-'); 
    
    // Estructura de la Entidad Usuario del Backend
    const usuarioParaBackend = {
        nombre: formValues.nombre,
        correo: formValues.email, 
        telefono: formValues.telefono,
        run: run,
        dv: dv,
        contrasenia: formValues.contrasena, 
        
        // Asumiendo que tu backend usa aPaterno y aMaterno
        aPaterno: "N/A", 
        aMaterno: "N/A",

        // Valores fijos/predeterminados
        idEstado: 1, 
        fechaRegistro: new Date().toISOString().slice(0, 19).replace('T', ' '),
        
        // Tipo de Usuario
        tipoUsuario: tipoUsuario,
    };
    
    return usuarioParaBackend;
};


/**
 * Gestiona las operaciones específicas del perfil de Ciudadano, principalmente el registro.
 */
export const CiudadanoService = {
  
    /**
     * Registra un nuevo Ciudadano.
     * @param formValues Los datos completos del formulario de registro.
     * @returns Promesa con el Usuario creado (UserData).
     */
    registerCiudadano: async (formValues: UserRegistroType): Promise<UserData> => {
        
        const registroBody = buildRegistroBody(formValues, CIUDADANO_TIPO);

        try {
            const response: AxiosResponse<UserData> = await axios.post(REGISTER_URL, registroBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            // Manejo y propagación de errores (ej: 409 Conflict)
            throw error; 
        }
    },
    
    // Aquí podrías añadir otros métodos específicos de Ciudadano si son necesarios, 
    // como actualizar su dirección principal.
};