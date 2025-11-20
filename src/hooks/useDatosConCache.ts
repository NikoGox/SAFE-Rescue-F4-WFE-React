// hooks/useDatosConCache.ts
import { useState, useEffect, useCallback } from 'react';
import { useSincronizacion } from './useSincronizacion';

export const useDatosConCache = <T>(
    claveCache: string,
    funcionFetch: () => Promise<T>,
    dependencias: any[] = []
) => {
    const [datos, setDatos] = useState<T | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { 
        sincronizarDatos, 
        sincronizando, 
        errores,
        generarClaveCache 
    } = useSincronizacion();

    const claveCompleta = generarClaveCache(claveCache, dependencias);

    const cargarDatos = useCallback(async (forzar: boolean = false) => {
        setCargando(true);
        setError(null);
        
        try {
            const resultado = await sincronizarDatos(claveCompleta, funcionFetch, forzar);
            setDatos(resultado);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
            setError(errorMessage);
        } finally {
            setCargando(false);
        }
    }, [claveCompleta, funcionFetch, sincronizarDatos]);

    // Cargar datos automáticamente
    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const recargar = useCallback(() => {
        cargarDatos(true);
    }, [cargarDatos]);

    return {
        datos,
        cargando: cargando || sincronizando,
        error: error || (errores.length > 0 ? errores[0] : null),
        recargar,
        errores
    };
};