// src/hooks/useCiudadano.ts
import { useState, useCallback } from 'react';
import CiudadanoService from '../service/services/perfiles/CiudadanoService';
import type { CiudadanoData } from '../types/PerfilesType';

interface UseCiudadanoReturn {
    ciudadano: CiudadanoData | null;
    cargando: boolean;
    error: string | null;
    buscarPorId: (id: number) => Promise<void>;
    actualizarCiudadano: (id: number, datos: Partial<CiudadanoData>) => Promise<void>;
    limpiar: () => void;
}

export const useCiudadano = (): UseCiudadanoReturn => {
    const [ciudadano, setCiudadano] = useState<CiudadanoData | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buscarPorId = useCallback(async (id: number) => {
        setCargando(true);
        setError(null);
        
        try {
            console.log(` Buscando ciudadano con ID: ${id}`);
            const datos = await CiudadanoService.buscarCiudadanoPorId(id);
            setCiudadano(datos);
            console.log(' Ciudadano encontrado:', datos);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error(' Error al buscar ciudadano:', errorMessage);
        } finally {
            setCargando(false);
        }
    }, []);

    const actualizarCiudadano = useCallback(async (id: number, datos: Partial<CiudadanoData>) => {
        setCargando(true);
        setError(null);
        
        try {
            console.log(` Actualizando ciudadano con ID: ${id}`, datos);
            const ciudadanoActualizado = await CiudadanoService.actualizarCiudadano(id, datos);
            setCiudadano(ciudadanoActualizado);
            console.log(' Ciudadano actualizado:', ciudadanoActualizado);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error(' Error al actualizar ciudadano:', errorMessage);
        } finally {
            setCargando(false);
        }
    }, []);

    const limpiar = useCallback(() => {
        setCiudadano(null);
        setError(null);
    }, []);

    return {
        ciudadano,
        cargando,
        error,
        buscarPorId,
        actualizarCiudadano,
        limpiar
    };
};