// src/Test/Register.Test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Registrarse from "../pages/Registrarse";

describe("Register Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("muestra todos los campos del formulario", () => {
        render(
            <MemoryRouter>
                <Registrarse />
            </MemoryRouter>
        );

        expect(screen.getByTestId('register-nombre')).toBeInTheDocument();
        expect(screen.getByTestId('register-rut')).toBeInTheDocument();
        expect(screen.getByTestId('register-correo')).toBeInTheDocument();
        expect(screen.getByTestId('register-direccion')).toBeInTheDocument();
        expect(screen.getByTestId('register-telefono')).toBeInTheDocument();
        expect(screen.getByTestId('register-nombreUsuario')).toBeInTheDocument();
        expect(screen.getByTestId('register-contrasena')).toBeInTheDocument();
        expect(screen.getByTestId('register-confirmarContrasena')).toBeInTheDocument();
        expect(screen.getByTestId('register-submit')).toBeInTheDocument();
    });

    it("valida campos vacíos", async () => {
        render(
            <MemoryRouter>
                <Registrarse />
            </MemoryRouter>
        );

        const submitButton = screen.getByTestId('register-submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            const errors = screen.getAllByText(/es obligatorio/i);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    it("maneja el registro exitoso", async () => {
        render(
            <MemoryRouter>
                <Registrarse />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByTestId('register-nombre'), {
            target: { value: "Juan Pérez" }
        });
        fireEvent.change(screen.getByTestId('register-rut'), {
            target: { value: "11111111-1" }
        });
        fireEvent.change(screen.getByTestId('register-correo'), {
            target: { value: "juan@example.com" }
        });
        fireEvent.change(screen.getByTestId('register-direccion'), {
            target: { value: "Calle Ejemplo 123" }
        });
        fireEvent.change(screen.getByTestId('register-telefono'), {
            target: { value: "912345678" }
        });
        fireEvent.change(screen.getByTestId('register-nombreUsuario'), {
            target: { value: "juanperez" }
        });
        fireEvent.change(screen.getByTestId('register-contrasena'), {
            target: { value: "password123" }
        });
        fireEvent.change(screen.getByTestId('register-confirmarContrasena'), {
            target: { value: "password123" }
        });
        
        const terminos = screen.getByTestId('register-terms');
        fireEvent.click(terminos);

        const submitButton = screen.getByTestId('register-submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            const errors = screen.queryAllByText(/inválido|obligatorio/i);
            expect(errors.length).toBe(0);
        });
    });

    it("muestra error cuando el usuario ya existe", async () => {
        const usuarioExistente = {
            nombre: "Juan Pérez",
            rut: "11111111-1",
            correo: "juan@example.com",
            direccion: "Calle Ejemplo 123", 
            telefono: "912345678",
            nombreUsuario: "juanperez",
            contrasena: "password123"
        };
        localStorage.setItem('usuariosRegistrados', JSON.stringify([usuarioExistente]));

        render(
            <MemoryRouter>
                <Registrarse />
            </MemoryRouter>
        );

        // Fill form with existing user data
        fireEvent.change(screen.getByTestId('register-nombre'), {
            target: { value: "Juan Pérez" }
        });
        fireEvent.change(screen.getByTestId('register-rut'), {
            target: { value: "11111111-1" }
        });
        fireEvent.change(screen.getByTestId('register-correo'), {
            target: { value: "juan@example.com" }
        });
        fireEvent.change(screen.getByTestId('register-direccion'), {
            target: { value: "Calle Ejemplo 123" }
        });
        fireEvent.change(screen.getByTestId('register-telefono'), {
            target: { value: "912345678" }
        });
        fireEvent.change(screen.getByTestId('register-nombreUsuario'), {
            target: { value: "juanperez" }
        });
        fireEvent.change(screen.getByTestId('register-contrasena'), {
            target: { value: "password123" }
        });
        fireEvent.change(screen.getByTestId('register-confirmarContrasena'), {
            target: { value: "password123" }
        });

        const terminos = screen.getByTestId('register-terms');
        fireEvent.click(terminos);

        const submitButton = screen.getByTestId('register-submit');
        fireEvent.click(submitButton);

        // Wait for and check the exact error message
        await waitFor(() => {
            const errorMessage = screen.getByText("El correo electrónico o nombre de usuario ya está registrado.");
            expect(errorMessage).toBeInTheDocument();
        }, { timeout: 2000 });
    });
});