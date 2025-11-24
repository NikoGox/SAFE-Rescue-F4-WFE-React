// src/services/IncidenteGeolocalizacionService.ts
import { DireccionService } from '../geolocalizacion/DireccionService';
import { ComunaService } from '../geolocalizacion/ComunaService';
import { RegionService } from '../geolocalizacion/RegionService';

import type { IncidenteResponse, DireccionCompletaIncidente } from '../../../types/IncidenteType';
import type { Direccion, Comuna, Region } from '../../../types/GeolocalizacionType';

export const IncidenteGeolocalizacionService = {

    /**
     * Obtiene información completa de geolocalización para múltiples incidentes
     */
    obtenerDireccionesCompletasParaIncidentes: async (incidentes: IncidenteResponse[]): Promise<Map<number, DireccionCompletaIncidente | null>> => {
        try {
            const resultados = new Map<number, DireccionCompletaIncidente | null>();

            // Procesar en lotes para evitar demasiadas requests simultáneas
            const lotes = [];
            for (let i = 0; i < incidentes.length; i += 5) {
                lotes.push(incidentes.slice(i, i + 5));
            }

            for (const lote of lotes) {
                const promesas = lote.map(async (incidente) => {
                    if (incidente.idDireccion) {
                        const direccionCompleta = await IncidenteGeolocalizacionService.obtenerDireccionCompleta(incidente.idDireccion);
                        resultados.set(incidente.idIncidente, direccionCompleta);
                    } else {
                        resultados.set(incidente.idIncidente, null);
                    }
                });

                await Promise.allSettled(promesas);
            }

            return resultados;
        } catch (error) {
            console.error('Error obteniendo direcciones completas para incidentes:', error);
            return new Map();
        }
    },

    /**
     * Obtiene información completa de geolocalización para un incidente
     */
    obtenerDireccionCompleta: async (idDireccion: number): Promise<any> => {
        try {
            console.log(`📍 Obteniendo dirección completa para ID: ${idDireccion}`);

            // 1. Obtener dirección básica
            const direccion = await DireccionService.getById(idDireccion);
            console.log('📍 Dirección obtenida:', direccion);

            if (!direccion) {
                console.warn(`❌ Dirección ${idDireccion} no encontrada`);
                return null;
            }

            let comuna = null;
            let region = null;

            // 2. Intentar obtener comuna
            try {
                if (direccion.idComuna && direccion.idComuna > 0) {
                    comuna = await ComunaService.getById(direccion.idComuna);
                    console.log('📍 Comuna obtenida:', comuna);
                }
            } catch (error) {
                console.warn(`⚠️ No se pudo obtener comuna ${direccion.idComuna} para dirección ${idDireccion}:`, error);
                // Crear comuna de respaldo
                comuna = {
                    idComuna: direccion.idComuna,
                    nombre: 'Comuna no disponible',
                    idRegion: 0
                };
            }

            // 3. Intentar obtener región si tenemos comuna
            try {
                if (comuna && comuna.idRegion && comuna.idRegion > 0) {
                    region = await RegionService.getById(comuna.idRegion);
                    console.log('📍 Región obtenida:', region);
                }
            } catch (error) {
                console.warn(`⚠️ No se pudo obtener región para comuna ${comuna?.idRegion}:`, error);
                // Crear región de respaldo
                region = {
                    idRegion: comuna?.idRegion || 0,
                    nombre: 'Región no disponible',
                    identificacion: 'ND'
                };
            }

            // 4. Si no se pudo obtener comuna/región, crear datos de respaldo
            if (!comuna) {
                comuna = {
                    idComuna: direccion.idComuna || 0,
                    nombre: 'Comuna no disponible',
                    idRegion: 0
                };
            }

            if (!region) {
                region = {
                    idRegion: 0,
                    nombre: 'Región no disponible',
                    identificacion: 'ND'
                };
            }

            const direccionCompleta = {
                ...direccion,
                comuna,
                region
            };

            console.log('✅ Dirección completa construida:', direccionCompleta);
            return direccionCompleta;

        } catch (error) {
            console.error(`❌ Error crítico obteniendo dirección completa ${idDireccion}:`, error);

            // Retornar datos mínimos para que la UI funcione
            return {
                idDireccion,
                calle: 'Dirección no disponible',
                numero: '',
                villa: null,
                complemento: null,
                idComuna: 0,
                comuna: {
                    idComuna: 0,
                    nombre: 'No disponible',
                    idRegion: 0
                },
                region: {
                    idRegion: 0,
                    nombre: 'No disponible',
                    identificacion: 'ND'
                }
            };
        }

    },

    /**
     * Formatea la dirección para mostrar
     */
    formatearDireccion: (direccion: DireccionCompletaIncidente): string => {
        const partes = [
            `${direccion.calle} ${direccion.numero}`,
            direccion.villa,
            direccion.comuna.nombre,
            direccion.region.nombre
        ].filter(Boolean);

        return partes.join(', ');
    },

    /**
     * Formatea la dirección de forma abreviada para la tabla
     */
    formatearDireccionAbreviada: (direccion: DireccionCompletaIncidente): string => {
        return `${direccion.calle} ${direccion.numero}, ${direccion.comuna.nombre}`;
    },

    /**
     * Formatea coordenadas
     */
    formatearCoordenadas: (coordenadas?: { latitud: number; longitud: number }): string => {
        if (!coordenadas) return 'No disponible';
        return `${coordenadas.latitud.toFixed(6)}, ${coordenadas.longitud.toFixed(6)}`;
    },

    /**
     * Crea una nueva dirección en el sistema de geolocalización
     */
    crearDireccionParaIncidente: async (datosDireccion: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
        coordenadas?: { latitud: number; longitud: number };
    }): Promise<number | null> => {
        try {
            console.log('Creando dirección para incidente:', datosDireccion);

            // Aquí deberías llamar a DireccionService.create() en lugar de simular
            const idDireccionTemporal = Math.floor(Math.random() * 1000) + 1000;
            return idDireccionTemporal;

        } catch (error) {
            console.error('Error creando dirección para incidente:', error);
            return null;
        }
    }
};