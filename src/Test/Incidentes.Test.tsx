// src/Test/Incidentes.Test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Incidentes from "../pages/Incidentes";

describe("Incidentes Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it("permite editar un incidente existente", async () => {
        render(
            <MemoryRouter>
                <Incidentes />
            </MemoryRouter>
        );

        // Esperar a que los datos se carguen
        await waitFor(() => {
            expect(screen.queryByText('Cargando incidentes...')).not.toBeInTheDocument();
        });

        // 1. Expandir los detalles del incidente
        const detallesButton = screen.getAllByTitle('Ver detalles')[0];
        fireEvent.click(detallesButton);

        // 2. Hacer clic en el botón de editar
        const editarButton = screen.getAllByTitle('Editar incidente')[0];
        fireEvent.click(editarButton);

        // 3. Editar la descripción
        const descripcionInput = await screen.findByTestId('edit-description-textarea');
        fireEvent.change(descripcionInput, {
            target: { value: "Nueva descripción de prueba" }
        });

        // 4. Guardar cambios
        const guardarButton = screen.getByTestId('save-changes');
        fireEvent.click(guardarButton);

        // 5. Volver a expandir los detalles para ver los cambios
        const detallesButtonAfterEdit = screen.getAllByTitle('Ver detalles')[0];
        fireEvent.click(detallesButtonAfterEdit);

        // 6. Verificar que los cambios se guardaron
        await waitFor(() => {
            const descripcionElement = screen.getByTestId('incident-description-text');
            expect(descripcionElement).toHaveTextContent("Nueva descripción de prueba");
        });
    });
    
    describe("Validaciones de Formularios", () => {
        it("valida campos vacíos al crear nuevo incidente", async () => {
            render(
                <MemoryRouter>
                    <Incidentes />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.queryByText('Cargando incidentes...')).not.toBeInTheDocument();
            });

            // Abrir formulario
            const btnNuevo = screen.getByTestId('btn-nuevo-incidente');
            fireEvent.click(btnNuevo);

            // Intentar enviar formulario vacío
            const form = screen.getByRole('form');
            fireEvent.submit(form);

            // Verificar mensaje de error
            await waitFor(() => {
                expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos requeridos');
            });
        });

        it("valida formato de campos al crear nuevo incidente", async () => {
            render(
                <MemoryRouter>
                    <Incidentes />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.queryByText('Cargando incidentes...')).not.toBeInTheDocument();
            });

            // Abrir formulario
            const btnNuevo = screen.getByTestId('btn-nuevo-incidente');
            fireEvent.click(btnNuevo);

            // Llenar con datos inválidos
            const typeInput = screen.getByLabelText(/tipo de incidente/i);
            const locationInput = screen.getByLabelText(/ubicación/i);
            const descriptionInput = screen.getByLabelText(/descripción detallada/i);

            fireEvent.change(typeInput, { target: { value: "a" } });
            fireEvent.change(locationInput, { target: { value: "b" } });
            fireEvent.change(descriptionInput, { target: { value: "c" } });

            // Enviar formulario
            const submitButton = screen.getByRole('button', { name: /enviar reporte/i });
            fireEvent.click(submitButton);

            // Verificar mensaje de error
            expect(window.alert).toHaveBeenCalledWith('Por favor, proporcione información más detallada');
        });
    });
});