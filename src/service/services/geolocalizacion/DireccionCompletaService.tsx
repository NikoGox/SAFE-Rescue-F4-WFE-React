// src/services/geolocalizacion/DireccionCompletaService.ts

import type { Direccion, Comuna, Region } from '../../../types/GeolocalizacionType';
import { DireccionService } from './DireccionService';
import { ComunaService } from './ComunaService';
import { RegionService } from './RegionService';

export interface DireccionCompleta extends Direccion {
    comuna: Comuna;
    region: Region;
}

export const DireccionCompletaService = {
    /**
     * Obtiene todas las direcciones con información completa de comuna y región
     */
    getAllCompletas: async (): Promise<DireccionCompleta[]> => {
        try {
            // Obtener direcciones básicas
            const direcciones = await DireccionService.getAll();
            
            // Obtener comunas y regiones para enriquecer las direcciones
            const comunas = await ComunaService.getAll();
            const regiones = await RegionService.getAll();
            
            // Crear mapas para búsqueda rápida
            const comunaMap = new Map(comunas.map(c => [c.idComuna, c]));
            const regionMap = new Map(regiones.map(r => [r.idRegion, r]));
            
            // Enriquecer direcciones con información completa
            const direccionesCompletas: DireccionCompleta[] = direcciones.map(direccion => {
                const comuna = comunaMap.get(direccion.idComuna);
                let region: Region | undefined;
                
                if (comuna) {
                    region = regionMap.get(comuna.idRegion);
                }
                
                if (!comuna || !region) {
                    console.warn(`No se encontró información completa para dirección ID: ${direccion.idDireccion}`);
                }
                
                return {
                    ...direccion,
                    comuna: comuna || { 
                        idComuna: direccion.idComuna, 
                        nombre: 'Desconocida', 
                        idRegion: 0 
                    },
                    region: region || { 
                        idRegion: 0, 
                        nombre: 'Desconocida', 
                        identificacion: '' 
                    }
                };
            });
            
            return direccionesCompletas;
        } catch (error) {
            console.error("[DireccionCompletaService] Error en getAllCompletas:", error);
            throw error;
        }
    }
};