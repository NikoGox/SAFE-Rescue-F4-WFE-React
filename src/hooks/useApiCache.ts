// hooks/useApiCache.ts
import { useState, useCallback, useEffect } from 'react';

export interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
  etag?: string;
  lastModified?: string;
}

export interface CacheStore {
  [key: string]: CacheItem;
}

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 30 * 60 * 1000, // 30 minutos
  LONG: 2 * 60 * 60 * 1000, // 2 horas
  SESSION: 24 * 60 * 60 * 1000, // 24 horas
  NEVER: 365 * 24 * 60 * 60 * 1000 // 1 año (prácticamente nunca)
} as const;

export type CacheDuration = keyof typeof CACHE_DURATION;

interface CacheStats {
  totalItems: number;
  itemsExpirados: number;
  tamañoAproximado: number;
  hitRate: number;
}

interface CacheOptions {
  etag?: string;
  lastModified?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const useApiCache = () => {
  const [cache, setCache] = useState<CacheStore>({});
  const [stats, setStats] = useState<CacheStats>({
    totalItems: 0,
    itemsExpirados: 0,
    tamañoAproximado: 0,
    hitRate: 0
  });
  const [accessCount, setAccessCount] = useState({ hits: 0, misses: 0 });

  // Cargar cache persistente al inicializar
  useEffect(() => {
    cargarCachePersistente();
  }, []);

  // Actualizar estadísticas cuando cambia el cache
  useEffect(() => {
    actualizarEstadisticas();
  }, [cache]);

  const cargarCachePersistente = useCallback(() => {
    try {
      const persistentCache: CacheStore = {};
      let loadedItems = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const cacheItem: CacheItem = JSON.parse(stored);
              // Solo cargar si no está expirado
              if (!estaExpirado(cacheItem)) {
                const cacheKey = key.replace('cache_', '');
                persistentCache[cacheKey] = cacheItem;
                loadedItems++;
              } else {
                // Limpiar expirados
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            console.warn(`Error al cargar cache item ${key}:`, error);
            localStorage.removeItem(key);
          }
        }
      }

      setCache(persistentCache);
      console.log(`🔄 Cache cargado: ${loadedItems} items`);
    } catch (error) {
      console.error('Error al cargar cache persistente:', error);
    }
  }, []);

  const generarClaveCache = useCallback((endpoint: string, parametros?: any): string => {
    const paramsString = parametros ? JSON.stringify(parametros) : '';
    // Crear hash simple para evitar claves demasiado largas
    const hash = btoa(encodeURIComponent(`${endpoint}${paramsString}`)).slice(0, 32);
    return hash;
  }, []);

  const guardarEnCache = useCallback((
    clave: string,
    data: any,
    duracion: CacheDuration = 'MEDIUM',
    options: CacheOptions = {}
  ): void => {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_DURATION[duracion],
      etag: options.etag,
      lastModified: options.lastModified
    };

    setCache((prev: CacheStore) => ({
      ...prev,
      [clave]: cacheItem
    }));

    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem(`cache_${clave}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('No se pudo guardar en localStorage, limpiando cache viejo:', error);
      // Intentar limpiar cache viejo si localStorage está lleno
      limpiarCacheExpirado();
    }
  }, []);

  const obtenerDeCache = useCallback(<T>(clave: string): T | null => {
    // Buscar en memoria primero
    const memoriaItem = cache[clave];

    if (memoriaItem) {
      if (!estaExpirado(memoriaItem)) {
        setAccessCount(prev => ({ ...prev, hits: prev.hits + 1 }));
        return memoriaItem.data;
      } else {
        // Eliminar de memoria si está expirado
        setCache(prev => {
          const nuevo = { ...prev };
          delete nuevo[clave];
          return nuevo;
        });
      }
    }

    // Si no está en memoria o está expirado, buscar en localStorage
    try {
      const stored = localStorage.getItem(`cache_${clave}`);
      if (stored) {
        const localStorageItem: CacheItem = JSON.parse(stored);
        if (!estaExpirado(localStorageItem)) {
          // Actualizar memoria
          setCache(prev => ({
            ...prev,
            [clave]: localStorageItem
          }));
          setAccessCount(prev => ({ ...prev, hits: prev.hits + 1 }));
          return localStorageItem.data;
        } else {
          // Limpiar expirado
          localStorage.removeItem(`cache_${clave}`);
        }
      }
    } catch (error) {
      console.warn('Error al leer cache de localStorage:', error);
    }

    setAccessCount(prev => ({ ...prev, misses: prev.misses + 1 }));
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
      try {
        localStorage.removeItem(`cache_${clave}`);
      } catch (error) {
        console.warn(`Error al invalidar cache ${clave}:`, error);
      }
    } else {
      // Invalidar todo
      setCache({});
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith('cache_'))
          .forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Error al limpiar cache completo:', error);
      }
    }
  }, []);

  const limpiarCacheExpirado = useCallback((): void => {
    setCache((prev: CacheStore) => {
      const nuevoCache: CacheStore = {};
      let itemsEliminados = 0;

      Object.entries(prev).forEach(([key, item]) => {
        if (!estaExpirado(item)) {
          nuevoCache[key] = item;
        } else {
          itemsEliminados++;
          try {
            localStorage.removeItem(`cache_${key}`);
          } catch (error) {
            console.warn(`Error al limpiar cache expirado ${key}:`, error);
          }
        }
      });

      console.log(`🧹 Cache limpiado: ${itemsEliminados} items expirados eliminados`);
      return nuevoCache;
    });
  }, []);

  const actualizarEstadisticas = useCallback(() => {
    const claves = Object.keys(cache);
    const itemsExpirados = claves.filter(key => estaExpirado(cache[key])).length;
    const totalAccesses = accessCount.hits + accessCount.misses;
    const hitRate = totalAccesses > 0 ? (accessCount.hits / totalAccesses) * 100 : 0;

    setStats({
      totalItems: claves.length,
      itemsExpirados,
      tamañoAproximado: JSON.stringify(cache).length,
      hitRate: Math.round(hitRate * 100) / 100
    });
  }, [cache, accessCount]);

  const obtenerEstadisticasCache = useCallback((): CacheStats => {
    return stats;
  }, [stats]);

  const precalentarCache = useCallback(async (
    endpoints: Array<{ endpoint: string; parametros?: any; duracion?: CacheDuration }>,
    fetchFunction: (endpoint: string, params?: any) => Promise<any>
  ): Promise<void> => {
    console.log('🔥 Precalentando cache...');

    const promises = endpoints.map(async ({ endpoint, parametros, duracion = 'MEDIUM' }) => {
      try {
        const clave = generarClaveCache(endpoint, parametros);
        const datosExistentes = obtenerDeCache(clave);

        if (!datosExistentes) {
          const data = await fetchFunction(endpoint, parametros);
          guardarEnCache(clave, data, duracion);
          console.log(`✅ Cache precalentado: ${endpoint}`);
        }
      } catch (error) {
        console.warn(`❌ Error precalentando ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('✅ Precalentamiento completado');
  }, [generarClaveCache, obtenerDeCache, guardarEnCache]);

  return {
    guardarEnCache,
    obtenerDeCache,
    invalidarCache,
    generarClaveCache,
    obtenerEstadisticasCache,
    limpiarCacheExpirado,
    precalentarCache,
    CACHE_DURATION,
    stats
  };
};