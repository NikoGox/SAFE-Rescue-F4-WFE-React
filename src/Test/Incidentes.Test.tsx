// src/Test/Incidentes.Test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Incidentes from "../pages/Incidentes";

// Mocks para los servicios
vi.mock("../../service/services/incidentes/IncidenteService", () => ({
    default: {
        listarIncidentes: vi.fn().mockResolvedValue([
            {
                idIncidente: 1,
                titulo: "Incendio en edificio",
                detalle: "Incendio de prueba",
                fechaRegistro: "2025-11-25T10:00:00",
                tipoIncidente: { idTipoIncidente: 1, nombre: "Incendio" },
                idEstadoIncidente: 1,
                idDireccion: 1,
                direccion: "Calle Principal 123"
            }
        ]),
        crearIncidente: vi.fn().mockResolvedValue({ idIncidente: 2 }),
        actualizarParcialIncidente: vi.fn().mockResolvedValue({}),
        eliminarIncidente: vi.fn().mockResolvedValue({})
    }
}));

vi.mock("../../service/services/incidentes/TipoIncidenteService", () => ({
    default: {
        listarTiposIncidente: vi.fn().mockResolvedValue([
            { idTipoIncidente: 1, nombre: "Incendio" },
            { idTipoIncidente: 2, nombre: "Explosión" },
            { idTipoIncidente: 3, nombre: "Accidente Vehicular" }
        ])
    }
}));

vi.mock("../../service/services/geolocalizacion/ComunaService", () => ({
    ComunaService: {
        getAll: vi.fn().mockResolvedValue([
            { idComuna: 1, nombre: "Santiago", codigoPostal: "7500001" },
            { idComuna: 2, nombre: "Providencia", codigoPostal: "7500002" },
            { idComuna: 3, nombre: "Las Condes", codigoPostal: "7500003" }
        ])
    }
}));

vi.mock("../../service/services/geolocalizacion/RegionService", () => ({
    RegionService: {
        getAll: vi.fn().mockResolvedValue([
            { idRegion: 1, nombre: "Región Metropolitana", identificacion: "RM" }
        ])
    }
}));

vi.mock("../../service/services/geolocalizacion/DireccionService", () => ({
    DireccionService: {
        create: vi.fn().mockResolvedValue({ idDireccion: 1 }),
        getById: vi.fn().mockResolvedValue({ calle: "Calle Test", numero: "123" }),
        getAll: vi.fn().mockResolvedValue([])
    }
}));

vi.mock("../../service/services/geolocalizacion/CoordenadaService", () => ({
    CoordenadasService: {
        create: vi.fn().mockResolvedValue({ idCoordenadas: 1 }),
        getAll: vi.fn().mockResolvedValue([])
    }
}));

vi.mock("../../service/services/registros/FotoService", () => ({
    FotoService: {
        obtenerUrlPublicaPorId: vi.fn().mockReturnValue("/assets/default_incident.png")
    }
}));

// Mock para useImageUpload hook
vi.mock("../../hooks/useImageUpload", () => ({
    useImageUpload: vi.fn(() => ({
        isModalOpen: false,
        currentImageUrl: "",
        temporaryImageUrl: "",
        isLoading: false,
        isUploading: false,
        uploadError: null,
        openModal: vi.fn(),
        closeModal: vi.fn(),
        handleImageSelect: vi.fn(),
        handleImageSave: vi.fn(),
        handleImageDelete: vi.fn(),
        clearTemporaryImage: vi.fn(),
        temporaryFile: null
    }))
}));

// Mock para ImageUploadModal
vi.mock("../../components/ImageUploadModal", () => ({
    default: ({ isOpen, onClose }: any) =>
        isOpen ? <div data-testid="image-upload-modal">Modal de Imagen</div> : null
}));

describe("Incidentes Component - Formularios", () => {
    let alertMock: any;
    let consoleErrorMock: any;

    beforeEach(() => {
        // Mock más robusto para window.alert
        alertMock = vi.fn();
        global.alert = alertMock;

        // Mock console.error para suprimir advertencias de act
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => { });

        vi.clearAllMocks();
    });

    afterEach(() => {
        alertMock.mockRestore();
        consoleErrorMock.mockRestore();
    });

    const waitForDataToLoad = async () => {
        await waitFor(() => {
            expect(screen.queryByText('Cargando incidentes...')).not.toBeInTheDocument();
        });
    };

    const openCreateForm = async () => {
        const nuevoIncidenteBtn = await screen.findByTestId('btn-nuevo-incidente');
        await act(async () => {
            fireEvent.click(nuevoIncidenteBtn);
        });

        // Esperar a que el formulario se abra completamente
        await waitFor(() => {
            expect(screen.getByRole('form')).toBeInTheDocument();
        });
    };

    describe("Test 1: Componentes del formulario de creación presentes", () => {
        it("debe renderizar todos los campos del formulario de creación", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Verificar que todos los campos estén presentes
            expect(screen.getByLabelText(/título del incidente \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/tipo de incidente \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/calle \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/número \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/villa\/población/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/complemento/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/comuna \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/descripción detallada \*/i)).toBeInTheDocument();
            expect(screen.getByText(/imagen del incidente/i)).toBeInTheDocument();

            // Botones de acción
            expect(screen.getByTestId('submit-incident')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
        });
    });

    describe("Test 2: Validación de formulario de creación con datos correctos", () => {
        it("debe permitir enviar el formulario con datos válidos", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Llenar formulario con datos válidos
            await act(async () => {
                fireEvent.change(screen.getByLabelText(/título del incidente \*/i), {
                    target: { value: "Incendio en edificio residencial" }
                });

                fireEvent.change(screen.getByLabelText(/tipo de incidente \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/calle \*/i), {
                    target: { value: "Avenida Principal" }
                });

                fireEvent.change(screen.getByLabelText(/número \*/i), {
                    target: { value: "123" }
                });

                fireEvent.change(screen.getByLabelText(/comuna \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/descripción detallada \*/i), {
                    target: { value: "Descripción detallada del incidente con más de 10 caracteres" }
                });
            });

            // Enviar formulario
            const submitButton = screen.getByTestId('submit-incident');
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Verificar que no se muestra error de validación inmediato
            expect(alertMock).not.toHaveBeenCalledWith('Por favor, complete todos los campos requeridos');
        });
    });

    describe("Test 3: Validación de formulario de creación con datos erróneos", () => {
        it("debe mostrar error al enviar formulario con título muy corto", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Llenar con datos inválidos (título muy corto)
            await act(async () => {
                fireEvent.change(screen.getByLabelText(/título del incidente \*/i), {
                    target: { value: "A" } // Menos de 5 caracteres
                });

                fireEvent.change(screen.getByLabelText(/tipo de incidente \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/calle \*/i), {
                    target: { value: "Calle Test" }
                });

                fireEvent.change(screen.getByLabelText(/número \*/i), {
                    target: { value: "123" }
                });

                fireEvent.change(screen.getByLabelText(/comuna \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/descripción detallada \*/i), {
                    target: { value: "Descripción válida" }
                });
            });

            // Enviar formulario
            const submitButton = screen.getByTestId('submit-incident');
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Verificar mensaje de error específico
            await waitFor(() => {
                expect(alertMock).toHaveBeenCalledWith('Por favor, ingrese un título más descriptivo (mínimo 5 caracteres)');
            });
        });

        it("debe mostrar error al enviar formulario con descripción muy corta", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Llenar con datos inválidos (descripción muy corta)
            await act(async () => {
                fireEvent.change(screen.getByLabelText(/título del incidente \*/i), {
                    target: { value: "Título válido de más de 5 caracteres" }
                });

                fireEvent.change(screen.getByLabelText(/tipo de incidente \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/calle \*/i), {
                    target: { value: "Calle Test" }
                });

                fireEvent.change(screen.getByLabelText(/número \*/i), {
                    target: { value: "123" }
                });

                fireEvent.change(screen.getByLabelText(/comuna \*/i), {
                    target: { value: "1" }
                });

                fireEvent.change(screen.getByLabelText(/descripción detallada \*/i), {
                    target: { value: "Corto" } // Menos de 10 caracteres
                });
            });

            // Enviar formulario
            const submitButton = screen.getByTestId('submit-incident');
            await act(async () => {
                fireEvent.click(submitButton);
            });

            // Verificar mensaje de error específico
            await waitFor(() => {
                expect(alertMock).toHaveBeenCalledWith('Por favor, proporcione una descripción más detallada');
            });
        });
    });

    describe("Test 4: Validación de formulario de creación con campos vacíos", () => {
        it("debe mostrar error al enviar formulario vacío", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Enviar formulario sin llenar campos - forma directa
            const submitButton = screen.getByTestId('submit-incident');

            // Simular el comportamiento del formulario directamente
            await act(async () => {
                // Disparar el evento submit directamente
                const form = screen.getByRole('form');
                fireEvent.submit(form);
            });

            // Verificar que se llamó a alert con el mensaje correcto
            expect(alertMock).toHaveBeenCalledWith('Por favor, complete todos los campos requeridos');
        });
    });



    describe("Test 5: Comportamiento de cancelación", () => {
        it("debe cerrar el formulario al cancelar", async () => {
            await act(async () => {
                render(
                    <MemoryRouter>
                        <Incidentes />
                    </MemoryRouter>
                );
            });

            await waitForDataToLoad();
            await openCreateForm();

            // Verificar que el formulario está abierto (usando un selector más específico)
            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByText('Reportar Nuevo Incidente', { selector: 'h2' })).toBeInTheDocument();

            // Hacer clic en cancelar
            const cancelarButton = screen.getByRole('button', { name: /cancelar/i });
            await act(async () => {
                fireEvent.click(cancelarButton);
            });

            // Verificar que el formulario se cerró
            await waitFor(() => {
                expect(screen.queryByRole('form')).not.toBeInTheDocument();
            });
        });
    });
});