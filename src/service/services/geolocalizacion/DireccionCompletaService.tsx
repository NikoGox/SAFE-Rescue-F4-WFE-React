// src/services/geolocalizacion/DireccionCompletaService.ts
import type { Direccion, Comuna, Region, DireccionCompleta, Coordenadas } from '../../../types/GeolocalizacionType';
import { DireccionService } from './DireccionService';
import { ComunaService } from './ComunaService';
import { RegionService } from './RegionService';
import { CoordenadasService } from './CoordenadaService';

export const DireccionCompletaService = {
  /**
   * Obtiene una dirección completa por ID con información de comuna, región y coordenadas
   */
  getByIdCompleta: async (idDireccion: number): Promise<DireccionCompleta | null> => {
    try {
      console.log(`Buscando dirección completa para ID: ${idDireccion}`);

      // Obtener dirección básica
      const direccion = await DireccionService.getById(idDireccion);
      console.log('Dirección básica encontrada:', direccion);

      // ESTRATEGIA PARA OBTENER idComuna
      let idComuna: number | undefined;

      if (direccion.comuna && typeof direccion.comuna === 'object') {
        // La comuna está anidada en el objeto comuna
        idComuna = direccion.comuna.idComuna;
        console.log('idComuna desde objeto comuna:', idComuna);
      } else {
        // Intentar desde el campo directo (backwards compatibility)
        idComuna = direccion.idComuna;
        console.log('idComuna desde campo directo:', idComuna);
      }

      if (!idComuna) {
        console.warn(`Dirección ${idDireccion} no tiene idComuna asignado`);
        return null;
      }

      // ESTRATEGIA PARA OBTENER idCoordenadas
      let idCoordenadas: number | undefined;

      if (direccion.coordenadas && typeof direccion.coordenadas === 'object') {
        // Las coordenadas están anidadas en el objeto coordenadas
        idCoordenadas = direccion.coordenadas.idCoordenadas;
        console.log('idCoordenadas desde objeto coordenadas:', idCoordenadas);
      } else {
        // Intentar desde el campo directo
        idCoordenadas = direccion.idCoordenadas;
        console.log('idCoordenadas desde campo directo:', idCoordenadas);
      }

      // Obtener todas las comunas, regiones y coordenadas si es necesario
      const [comunas, regiones] = await Promise.all([
        ComunaService.getAll(),
        RegionService.getAll()
      ]);

      console.log(`Comunas disponibles: ${comunas.length}, Regiones: ${regiones.length}`);

      // Buscar comuna
      const comuna = comunas.find(c => c.idComuna === idComuna);
      console.log('Comuna encontrada:', comuna);

      if (!comuna) {
        console.warn(`Comuna con ID ${idComuna} no encontrada en la lista de comunas disponibles`);
        return null;
      }

      // Buscar región usando idRegion de la comuna
      const region = regiones.find(r => r.idRegion === comuna.region.idRegion);
      console.log('Región encontrada:', region);

      if (!region) {
        console.warn(`Región con ID ${comuna.region.idRegion} no encontrada`);
        return null;
      }

      // Obtener coordenadas completas si existen
      let coordenadasCompletas: Coordenadas | undefined;

      if (idCoordenadas) {
        try {
          coordenadasCompletas = await CoordenadasService.getById(idCoordenadas);
          console.log('Coordenadas completas encontradas:', coordenadasCompletas);
        } catch (error) {
          console.warn(`No se pudieron cargar las coordenadas con ID ${idCoordenadas}:`, error);
          // Si hay coordenadas anidadas en la dirección, usarlas como fallback
          if (direccion.coordenadas && typeof direccion.coordenadas === 'object') {
            coordenadasCompletas = direccion.coordenadas as Coordenadas;
            console.log('Usando coordenadas anidadas como fallback:', coordenadasCompletas);
          }
        }
      } else if (direccion.coordenadas && typeof direccion.coordenadas === 'object') {
        // Usar coordenadas anidadas si no hay idCoordenadas
        coordenadasCompletas = direccion.coordenadas as Coordenadas;
        console.log('Usando coordenadas anidadas:', coordenadasCompletas);
      }

      // Construir la comuna completa con región
      let comunaCompleta = comuna;
      if (direccion.comuna && typeof direccion.comuna === 'object') {
        comunaCompleta = {
          ...comuna,
          ...direccion.comuna, // Mantener cualquier información adicional
          region: region // Asegurar que la región esté incluida
        };
      } else {
        comunaCompleta = {
          ...comuna,
          region: region
        };
      }

      // Construir la dirección completa
      const direccionCompleta: DireccionCompleta = {
        ...direccion,
        comuna: comunaCompleta,
        coordenadas: coordenadasCompletas
      };

      console.log('✅ Dirección completa construida exitosamente:', direccionCompleta);
      return direccionCompleta;

    } catch (error) {
      console.error("[DireccionCompletaService] Error en getByIdCompleta:", error);
      return null;
    }
  },

  /**
   * Obtiene todas las direcciones con información completa de comuna, región y coordenadas
   */
  getAllCompletas: async (): Promise<DireccionCompleta[]> => {
    try {
      const [direcciones, comunas, regiones] = await Promise.all([
        DireccionService.getAll(),
        ComunaService.getAll(),
        RegionService.getAll()
      ]);

      const direccionesCompletas: DireccionCompleta[] = [];

      for (const direccion of direcciones) {
        try {
          // Usar la misma lógica que getByIdCompleta
          let idComuna: number | undefined;

          if (direccion.comuna && typeof direccion.comuna === 'object') {
            idComuna = direccion.comuna.idComuna;
          } else {
            idComuna = direccion.idComuna;
          }

          if (!idComuna) continue;

          const comuna = comunas.find(c => c.idComuna === idComuna);
          const region = regiones.find(r => r.idRegion === comuna?.idRegion);

          if (!comuna || !region) continue;

          // Manejar coordenadas
          let idCoordenadas: number | undefined;
          let coordenadasCompletas: Coordenadas | undefined;

          if (direccion.coordenadas && typeof direccion.coordenadas === 'object') {
            idCoordenadas = direccion.coordenadas.idCoordenadas;
            coordenadasCompletas = direccion.coordenadas as Coordenadas;
          } else {
            idCoordenadas = direccion.idCoordenadas;
          }

          // Si tenemos idCoordenadas pero no las coordenadas completas, intentar cargarlas
          if (idCoordenadas && !coordenadasCompletas) {
            try {
              coordenadasCompletas = await CoordenadasService.getById(idCoordenadas);
            } catch (error) {
              console.warn(`No se pudieron cargar coordenadas ${idCoordenadas} para dirección ${direccion.idDireccion}`);
            }
          }

          // Construir comuna completa
          let comunaCompleta = comuna;
          if (direccion.comuna && typeof direccion.comuna === 'object') {
            comunaCompleta = {
              ...comuna,
              ...direccion.comuna,
              region: region
            };
          } else {
            comunaCompleta = {
              ...comuna,
              region: region
            };
          }

          direccionesCompletas.push({
            ...direccion,
            comuna: comunaCompleta,
            coordenadas: coordenadasCompletas
          });

        } catch (error) {
          console.warn(`Error procesando dirección ${direccion.idDireccion}:`, error);
          // Continuar con la siguiente dirección
        }
      }

      return direccionesCompletas;
    } catch (error) {
      console.error("[DireccionCompletaService] Error en getAllCompletas:", error);
      throw error;
    }
  },

  /**
   * Crea una dirección completa con comuna, región y coordenadas
   */
  createCompleta: async (direccionData: Omit<DireccionCompleta, 'idDireccion'>): Promise<string> => {
    try {
      console.log('Creando dirección completa:', direccionData);

      // Extraer datos para la creación
      const { comuna, coordenadas, ...datosDireccion } = direccionData;

      // Crear dirección básica
      const datosDireccionBasica: Omit<Direccion, 'idDireccion'> = {
        ...datosDireccion,
        idComuna: comuna.idComuna,
        idCoordenadas: coordenadas?.idCoordenadas
      };

      const mensaje = await DireccionService.create(datosDireccionBasica);
      console.log('✅ Dirección creada exitosamente:', mensaje);

      return mensaje;

    } catch (error) {
      console.error("[DireccionCompletaService] Error en createCompleta:", error);
      throw error;
    }
  }
};