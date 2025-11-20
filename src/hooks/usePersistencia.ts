// hooks/usePersistencia.ts
import { useState, useEffect, useCallback } from 'react';

// Tipos de datos que podemos persistir
type PersistedData = {
  auth?: any;
  usuario?: any;
  conversaciones?: any[];
  notificaciones?: any[];
  incidentes?: any[];
  configuracion?: any;
};

// Claves para localStorage
const PERSISTENCE_KEYS = {
  AUTH: 'safe_rescue_auth',
  USUARIO: 'safe_rescue_usuario',
  CONVERSACIONES: 'safe_rescue_conversaciones',
  NOTIFICACIONES: 'safe_rescue_notificaciones',
  INCIDENTES: 'safe_rescue_incidentes',
  CONFIGURACION: 'safe_rescue_configuracion'
} as const;

export const usePersistencia = () => {
  const [datosPersistidos, setDatosPersistidos] = useState<PersistedData>({});

  // Cargar datos al inicializar
  useEffect(() => {
    cargarDatosPersistidos();
  }, []);

  const cargarDatosPersistidos = useCallback(() => {
    try {
      const datos: PersistedData = {};
      
      Object.entries(PERSISTENCE_KEYS).forEach(([key, storageKey]) => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          datos[key.toLowerCase() as keyof PersistedData] = JSON.parse(stored);
        }
      });

      setDatosPersistidos(datos);
    } catch (error) {
      console.error('Error al cargar datos persistidos:', error);
    }
  }, []);

  const guardarDato = useCallback(<T>(clave: keyof PersistedData, dato: T): void => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as keyof typeof PERSISTENCE_KEYS];
      localStorage.setItem(storageKey, JSON.stringify(dato));
      
      setDatosPersistidos((prev: PersistedData) => ({
        ...prev,
        [clave]: dato
      }));
    } catch (error) {
      console.error(`Error al guardar ${clave}:`, error);
    }
  }, []);

  const obtenerDato = useCallback(<T>(clave: keyof PersistedData): T | null => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as keyof typeof PERSISTENCE_KEYS];
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Error al obtener ${clave}:`, error);
      return null;
    }
  }, []);

  const eliminarDato = useCallback((clave: keyof PersistedData): void => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as keyof typeof PERSISTENCE_KEYS];
      localStorage.removeItem(storageKey);
      
      setDatosPersistidos((prev: PersistedData) => {
        const nuevosDatos = { ...prev };
        delete nuevosDatos[clave];
        return nuevosDatos;
      });
    } catch (error) {
      console.error(`Error al eliminar ${clave}:`, error);
    }
  }, []);

  const limpiarTodo = useCallback((): void => {
    try {
      Object.values(PERSISTENCE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      setDatosPersistidos({});
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  }, []);

  return {
    datosPersistidos,
    guardarDato,
    obtenerDato,
    eliminarDato,
    limpiarTodo,
    cargarDatosPersistidos
  };
};