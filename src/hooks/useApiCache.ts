// hooks/useApiCache.ts
import { useState, useCallback } from 'react';

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number; // Tiempo en milisegundos
}

interface CacheStore {
  [key: string]: CacheItem;
}

const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 30 * 60 * 1000, // 30 minutos
  LONG: 2 * 60 * 60 * 1000, // 2 horas
  SESSION: 24 * 60 * 60 * 1000 // 24 horas
} as const;

export const useApiCache = () => {
  const [cache, setCache] = useState<CacheStore>({});

  const generarClaveCache = (endpoint: string, parametros?: any): string => {
    const paramsString = parametros ? JSON.stringify(parametros) : '';
    return `${endpoint}${paramsString}`;
  };

  const guardarEnCache = useCallback((
    clave: string, 
    data: any, 
    duracion: keyof typeof CACHE_DURATION = 'MEDIUM'
  ): void => {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_DURATION[duracion]
    };

    setCache((prev: CacheStore) => ({
      ...prev,
      [clave]: cacheItem
    }));

    // También guardar en localStorage para persistencia entre recargas
    try {
      localStorage.setItem(`cache_${clave}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('No se pudo guardar en localStorage:', error);
    }
  }, []);

  const obtenerDeCache = useCallback(<T>(clave: string): T | null => {
    // Primero buscar en memoria
    const memoriaItem = cache[clave];
    if (memoriaItem && !estaExpirado(memoriaItem)) {
      return memoriaItem.data;
    }

    // Si no está en memoria o está expirado, buscar en localStorage
    try {
      const stored = localStorage.getItem(`cache_${clave}`);
      if (stored) {
        const localStorageItem: CacheItem = JSON.parse(stored);
        if (!estaExpirado(localStorageItem)) {
          // Actualizar memoria con datos de localStorage
          setCache((prev: CacheStore) => ({
            ...prev,
            [clave]: localStorageItem
          }));
          return localStorageItem.data;
        } else {
          // Limpiar cache expirado
          localStorage.removeItem(`cache_${clave}`);
        }
      }
    } catch (error) {
      console.warn('Error al leer cache de localStorage:', error);
    }

    return null;
  }, [cache]);

  const estaExpirado = (item: CacheItem): boolean => {
    return Date.now() - item.timestamp > item.expiry;
  };

  const invalidarCache = useCallback((clave?: string): void => {
    if (clave) {
      setCache((prev: CacheStore) => {
        const nuevoCache = { ...prev };
        delete nuevoCache[clave];
        return nuevoCache;
      });
      localStorage.removeItem(`cache_${clave}`);
    } else {
      // Invalidar todo el cache
      setCache({});
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => localStorage.removeItem(key));
    }
  }, []);

  const obtenerEstadisticasCache = useCallback(() => {
    const claves = Object.keys(cache);
    return {
      totalItems: claves.length,
      itemsExpirados: claves.filter(key => estaExpirado(cache[key])).length,
      tamañoAproximado: JSON.stringify(cache).length
    };
  }, [cache]);

  return {
    guardarEnCache,
    obtenerDeCache,
    invalidarCache,
    generarClaveCache,
    obtenerEstadisticasCache,
    CACHE_DURATION
  };
};