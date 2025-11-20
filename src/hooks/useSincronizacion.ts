// hooks/useSincronizacion.ts
import { useState, useEffect, useCallback } from 'react';
import { useApiCache } from './useApiCache';

interface SincronizacionEstado {
  sincronizando: boolean;
  ultimaSincronizacion: Date | null;
  errores: string[];
}

export const useSincronizacion = () => {
  const [estado, setEstado] = useState<SincronizacionEstado>({
    sincronizando: false,
    ultimaSincronizacion: null,
    errores: []
  });

  const { guardarEnCache, obtenerDeCache, generarClaveCache } = useApiCache();

  const sincronizarDatos = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    forzarSincronizacion: boolean = false
  ): Promise<any> => {
    // Si no forzamos sincronización, intentar obtener de cache primero
    if (!forzarSincronizacion) {
      const datosCache = obtenerDeCache(clave);
      if (datosCache) {
        return datosCache;
      }
    }

    setEstado((prev: SincronizacionEstado) => ({ ...prev, sincronizando: true }));

    try {
      const datos = await funcionFetch();
      
      // Guardar en cache
      guardarEnCache(clave, datos, 'MEDIUM');
      
      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        ultimaSincronizacion: new Date(),
        errores: []
      }));

      return datos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        errores: [...prev.errores, errorMessage]
      }));

      throw error;
    }
  }, [guardarEnCache, obtenerDeCache]);

  const sincronizarConRetry = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    maxIntentos: number = 3
  ): Promise<any> => {
    let intentos = 0;
    
    while (intentos < maxIntentos) {
      try {
        return await sincronizarDatos(clave, funcionFetch, true);
      } catch (error) {
        intentos++;
        if (intentos === maxIntentos) {
          throw error;
        }
        // Esperar antes del siguiente intento (exponencial backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * intentos));
      }
    }
  }, [sincronizarDatos]);

  const limpiarErrores = useCallback(() => {
    setEstado((prev: SincronizacionEstado) => ({ ...prev, errores: [] }));
  }, []);

  return {
    ...estado,
    sincronizarDatos,
    sincronizarConRetry,
    limpiarErrores,
    generarClaveCache
  };
};