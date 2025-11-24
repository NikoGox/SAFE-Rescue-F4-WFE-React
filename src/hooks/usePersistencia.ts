// hooks/usePersistencia.ts
import { useState, useEffect, useCallback } from 'react';

// Tipos más específicos
export type PersistenceKey =
  | 'auth'
  | 'usuario'
  | 'conversaciones'
  | 'notificaciones'
  | 'incidentes'
  | 'configuracion'
  | 'geolocalizacion'
  | 'preferencias';

// En hooks/usePersistencia.ts - MEJORAR TIPADO
export interface PersistedData {
  auth?: any;
  usuario?: any;
  conversaciones?: any[];
  notificaciones?: any[];
  incidentes?: any[];
  configuracion?: any;
  geolocalizacion?: {
    regiones?: any[];
    comunas?: any[];
  };
  preferencias?: any;
}


// Claves para localStorage con tipos más seguros
const PERSISTENCE_KEYS: Record<Uppercase<PersistenceKey>, string> = {
  AUTH: 'safe_rescue_auth',
  USUARIO: 'safe_rescue_usuario',
  CONVERSACIONES: 'safe_rescue_conversaciones',
  NOTIFICACIONES: 'safe_rescue_notificaciones',
  INCIDENTES: 'safe_rescue_incidentes',
  CONFIGURACION: 'safe_rescue_configuracion',
  GEOLOCALIZACION: 'safe_rescue_geolocalizacion',
  PREFERENCIAS: 'safe_rescue_preferencias'
} as const;

// Opciones de persistencia
interface PersistenceOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live en milisegundos
}

export const usePersistencia = () => {
  const [datosPersistidos, setDatosPersistidos] = useState<PersistedData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al inicializar
  useEffect(() => {
    cargarDatosPersistidos();
  }, []);

  const cargarDatosPersistidos = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const datos: PersistedData = {};

      await Promise.all(
        Object.entries(PERSISTENCE_KEYS).map(async ([key, storageKey]) => {
          try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const parsedData = JSON.parse(stored);
              // Verificar si los datos han expirado
              if (parsedData._expiry && parsedData._expiry < Date.now()) {
                localStorage.removeItem(storageKey);
                return;
              }
              datos[key.toLowerCase() as PersistenceKey] = parsedData._data || parsedData;
            }
          } catch (error) {
            console.warn(`Error al cargar ${storageKey}:`, error);
          }
        })
      );

      setDatosPersistidos(datos);
    } catch (error) {
      console.error('Error al cargar datos persistidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const guardarDato = useCallback(<T>(
    clave: PersistenceKey,
    dato: T,
    options: PersistenceOptions = {}
  ): void => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as Uppercase<PersistenceKey>];

      const dataToStore = {
        _data: dato,
        _timestamp: Date.now(),
        ...(options.ttl && { _expiry: Date.now() + options.ttl })
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToStore));

      setDatosPersistidos((prev: PersistedData) => ({
        ...prev,
        [clave]: dato
      }));
    } catch (error) {
      console.error(`Error al guardar ${clave}:`, error);
      throw error;
    }
  }, []);

  const obtenerDato = useCallback(<T>(clave: PersistenceKey): T | null => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as Uppercase<PersistenceKey>];
      const stored = localStorage.getItem(storageKey);

      if (!stored) return null;

      const parsedData = JSON.parse(stored);

      // Verificar expiración
      if (parsedData._expiry && parsedData._expiry < Date.now()) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsedData._data || parsedData;
    } catch (error) {
      console.error(`Error al obtener ${clave}:`, error);
      return null;
    }
  }, []);

  const eliminarDato = useCallback((clave: PersistenceKey): void => {
    try {
      const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as Uppercase<PersistenceKey>];
      localStorage.removeItem(storageKey);

      setDatosPersistidos((prev: PersistedData) => {
        const nuevosDatos = { ...prev };
        delete nuevosDatos[clave];
        return nuevosDatos;
      });
    } catch (error) {
      console.error(`Error al eliminar ${clave}:`, error);
      throw error;
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
      throw error;
    }
  }, []);

  const existeDato = useCallback((clave: PersistenceKey): boolean => {
    const storageKey = PERSISTENCE_KEYS[clave.toUpperCase() as Uppercase<PersistenceKey>];
    return localStorage.getItem(storageKey) !== null;
  }, []);

  return {
    datosPersistidos,
    isLoading,
    guardarDato,
    obtenerDato,
    eliminarDato,
    limpiarTodo,
    existeDato,
    cargarDatosPersistidos
  };
};