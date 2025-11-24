// hooks/useSincronizacion.ts
import { useState, useCallback } from 'react';
import { useApiCache, type CacheDuration } from './useApiCache';
import { usePersistencia, type PersistenceKey } from './usePersistencia';

interface SincronizacionEstado {
  sincronizando: boolean;
  ultimaSincronizacion: Date | null;
  errores: string[];
  intentos: number;
}

interface SincronizacionOpciones {
  forzarSincronizacion?: boolean;
  maxIntentos?: number;
  persistir?: boolean;
  clavePersistencia?: PersistenceKey;
  duracionCache?: CacheDuration;
  ttlPersistencia?: number;
  headers?: Record<string, string>;
}

interface OperacionSincronizacion {
  clave: string;
  funcionFetch: () => Promise<any>;
  opciones?: SincronizacionOpciones;
}

export const useSincronizacion = () => {
  const [estado, setEstado] = useState<SincronizacionEstado>({
    sincronizando: false,
    ultimaSincronizacion: null,
    errores: [],
    intentos: 0
  });

  const apiCache = useApiCache();
  const persistencia = usePersistencia();

  const sincronizarDatos = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    opciones: SincronizacionOpciones = {}
  ): Promise<any> => {
    const {
      forzarSincronizacion = false,
      persistir = false,
      clavePersistencia,
      duracionCache = 'MEDIUM',
      ttlPersistencia,
      headers = {}
    } = opciones;

    // Estrategia de cache primero (a menos que se fuerce sincronización)
    if (!forzarSincronizacion) {
      // 1. Intentar desde persistencia
      if (persistir && clavePersistencia) {
        const datosPersistidos = persistencia.obtenerDato(clavePersistencia);
        if (datosPersistidos) {
          console.log(` Datos obtenidos de persistencia: ${clave}`);
          return datosPersistidos;
        }
      }

      // 2. Intentar desde cache
      const datosCache = apiCache.obtenerDeCache(clave);
      if (datosCache) {
        console.log(` Datos obtenidos de cache: ${clave}`);
        return datosCache;
      }
    }

    // Si no hay datos en cache o se fuerza sincronización, hacer fetch
    setEstado((prev: SincronizacionEstado) => ({
      ...prev,
      sincronizando: true,
      intentos: prev.intentos + 1
    }));

    try {
      console.log(`🔄 Sincronizando datos: ${clave}`);
      const datos = await funcionFetch();

      // Guardar en cache
      apiCache.guardarEnCache(clave, datos, duracionCache, {
        etag: headers['etag'],
        lastModified: headers['last-modified']
      });

      // Persistir si está configurado
      if (persistir && clavePersistencia) {
        persistencia.guardarDato(clavePersistencia, datos, {
          ttl: ttlPersistencia
        });
        console.log(` Datos persistidos: ${clavePersistencia}`);
      }

      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        ultimaSincronizacion: new Date(),
        errores: [],
        intentos: 0
      }));

      console.log(` Sincronización exitosa: ${clave}`);
      return datos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en sincronización';
      console.error(`❌ Error en sincronización ${clave}:`, error);

      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        errores: [...prev.errores, errorMessage]
      }));

      throw error;
    }
  }, [apiCache, persistencia]);

  const sincronizarConRetry = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    opciones: SincronizacionOpciones & { maxIntentos?: number } = {}
  ): Promise<any> => {
    const { maxIntentos = 3, ...restOpciones } = opciones;
    let intentos = 0;
    let ultimoError: Error | null = null;

    while (intentos < maxIntentos) {
      try {
        return await sincronizarDatos(clave, funcionFetch, {
          ...restOpciones,
          forzarSincronizacion: true
        });
      } catch (error) {
        intentos++;
        ultimoError = error instanceof Error ? error : new Error(String(error));

        if (intentos === maxIntentos) {
          const mensajeError = ultimoError?.message || 'Error desconocido';
          setEstado((prev: SincronizacionEstado) => ({
            ...prev,
            errores: [...prev.errores, `Falló después de ${maxIntentos} intentos: ${mensajeError}`]
          }));
          throw ultimoError;
        }

        // Esperar antes del siguiente intento (exponencial backoff)
        const delay = Math.min(1000 * Math.pow(2, intentos - 1), 30000); // Máximo 30 segundos
        console.log(` Reintento ${intentos}/${maxIntentos} en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Esta línea solo se ejecuta si el bucle termina sin retornar ni lanzar error
    const errorFinal = ultimoError || new Error('Error desconocido en sincronización con retry');
    throw errorFinal;
  }, [sincronizarDatos]);

  const sincronizarMultiple = useCallback(async (
    operaciones: OperacionSincronizacion[]
  ): Promise<any[]> => {
    setEstado((prev: SincronizacionEstado) => ({ ...prev, sincronizando: true }));

    try {
      console.log(` Sincronizando ${operaciones.length} operaciones...`);

      const resultados = await Promise.allSettled(
        operaciones.map(({ clave, funcionFetch, opciones }) =>
          sincronizarDatos(clave, funcionFetch, opciones)
        )
      );

      // Procesar resultados
      const datosExitosos: any[] = [];
      const errores: string[] = [];

      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          datosExitosos.push(resultado.value);
        } else {
          const errorMsg = `Operación ${index}: ${resultado.reason.message || 'Error desconocido'}`;
          errores.push(errorMsg);
          console.error(` Error en operación ${index}:`, resultado.reason);
        }
      });

      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        ultimaSincronizacion: new Date(),
        errores: [...prev.errores, ...errores]
      }));

      if (errores.length > 0) {
        console.warn(` Sincronización múltiple completada con ${errores.length} errores`);
      } else {
        console.log(` Sincronización múltiple exitosa: ${operaciones.length} operaciones`);
      }

      return datosExitosos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en sincronización múltiple';

      setEstado((prev: SincronizacionEstado) => ({
        ...prev,
        sincronizando: false,
        errores: [...prev.errores, errorMessage]
      }));

      throw error;
    }
  }, [sincronizarDatos]);

  const sincronizarConCondicion = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    condicion: () => boolean,
    opciones: SincronizacionOpciones = {}
  ): Promise<any | null> => {
    if (!condicion()) {
      console.log(`  Sincronización condicional omitida: ${clave}`);
      return null;
    }

    return await sincronizarDatos(clave, funcionFetch, opciones);
  }, [sincronizarDatos]);

  const sincronizarSiNecesario = useCallback(async (
    clave: string,
    funcionFetch: () => Promise<any>,
    opciones: SincronizacionOpciones & {
      intervaloMinimo?: number; // Tiempo mínimo entre sincronizaciones en ms
    } = {}
  ): Promise<any> => {
    const { intervaloMinimo = 30000, ...restOpciones } = opciones;

    // Verificar si es necesario sincronizar (basado en el tiempo)
    const ultimaSync = estado.ultimaSincronizacion;
    const ahora = new Date();

    if (ultimaSync && (ahora.getTime() - ultimaSync.getTime()) < intervaloMinimo) {
      console.log(`  Sincronización omitida por intervalo mínimo: ${clave}`);

      // Devolver datos de cache si existen
      const datosCache = apiCache.obtenerDeCache(clave);
      if (datosCache) {
        return datosCache;
      }

      // O de persistencia
      if (restOpciones.persistir && restOpciones.clavePersistencia) {
        const datosPersistidos = persistencia.obtenerDato(restOpciones.clavePersistencia);
        if (datosPersistidos) {
          return datosPersistidos;
        }
      }
    }

    return await sincronizarDatos(clave, funcionFetch, restOpciones);
  }, [sincronizarDatos, estado.ultimaSincronizacion, apiCache, persistencia]);

  const limpiarErrores = useCallback(() => {
    setEstado((prev: SincronizacionEstado) => ({ ...prev, errores: [] }));
  }, []);

  const reiniciarEstado = useCallback(() => {
    setEstado({
      sincronizando: false,
      ultimaSincronizacion: null,
      errores: [],
      intentos: 0
    });
  }, []);

  const obtenerEstadoSincronizacion = useCallback(() => {
    return {
      ...estado,
      estaSincronizando: estado.sincronizando,
      tieneErrores: estado.errores.length > 0,
      tiempoDesdeUltimaSync: estado.ultimaSincronizacion
        ? Date.now() - estado.ultimaSincronizacion.getTime()
        : null
    };
  }, [estado]);

  return {
    // Estado
    ...estado,

    // Métodos principales
    sincronizarDatos,
    sincronizarConRetry,
    sincronizarMultiple,
    sincronizarConCondicion,
    sincronizarSiNecesario,

    // Métodos de utilidad
    limpiarErrores,
    reiniciarEstado,
    obtenerEstadoSincronizacion,

    // Métodos delegados de cache
    limpiarCache: apiCache.invalidarCache,
    precalentarCache: apiCache.precalentarCache,
    generarClaveCache: apiCache.generarClaveCache,

    // Estadísticas
    cacheStats: apiCache.stats,

    // Métodos delegados de persistencia
    guardarEnPersistencia: persistencia.guardarDato,
    obtenerDePersistencia: persistencia.obtenerDato,
    eliminarDePersistencia: persistencia.eliminarDato
  };
};