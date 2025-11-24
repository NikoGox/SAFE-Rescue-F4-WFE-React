// hooks/useDatos.ts - Hook unificado que combina ambos
import { usePersistencia } from './usePersistencia';
import { useSincronizacion } from './useSincronizacion';

export const useDatos = () => {
  const persistencia = usePersistencia();
  const sincronizacion = useSincronizacion();

  // Métodos combinados para casos de uso comunes
  const cargarYPersistir = async (
    claveCache: string,
    clavePersistencia: Parameters<typeof persistencia.guardarDato>[0],
    funcionFetch: () => Promise<any>,
    opciones: Parameters<typeof sincronizacion.sincronizarDatos>[2] = {}
  ) => {
    const datos = await sincronizacion.sincronizarDatos(claveCache, funcionFetch, {
      ...opciones,
      persistir: true,
      clavePersistencia
    });
    return datos;
  };

  const obtenerDatos = (
    claveCache: string,
    clavePersistencia: Parameters<typeof persistencia.guardarDato>[0]
  ) => {
    // Intentar desde cache primero, luego desde persistencia
    return persistencia.obtenerDato(clavePersistencia);
  };

  return {
    // Exportar todo de ambos hooks
    ...persistencia,
    ...sincronizacion,
    
    // Métodos combinados
    cargarYPersistir,
    obtenerDatos
  };
};