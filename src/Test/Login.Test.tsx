import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dropdown from "../components/Dropdown";

describe("Login Component", () => {
    const mockOnLogin = vi.fn();
    const mockOnLogout = vi.fn();
    const defaultProps = {
        isLoggedIn: false,
        userName: "",
        onLogin: mockOnLogin,
        onLogout: mockOnLogout
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("muestra los campos de correo y contraseña", () => {
        render(
            <MemoryRouter>
                <Dropdown {...defaultProps} />
            </MemoryRouter>
        );

        const loginButton = screen.getByTestId('login-dropdown-toggle');
        fireEvent.click(loginButton);

        expect(screen.getByTestId('loginEmail')).toBeInTheDocument();
        expect(screen.getByTestId('loginPassword')).toBeInTheDocument();
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    });

    it("valida campos vacíos", async () => {
        render(
            <MemoryRouter>
                <Dropdown {...defaultProps} />
            </MemoryRouter>
        );

        const loginButton = screen.getByTestId('login-dropdown-toggle');
        fireEvent.click(loginButton);

        const submitButton = screen.getByTestId('login-submit-button');
        fireEvent.click(submitButton);

        const emailInput = screen.getByTestId('loginEmail');
        const passwordInput = screen.getByTestId('loginPassword');
        
        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });

    it("maneja el inicio de sesión exitoso", async () => {
        const usuariosMock = [{
            correo: "test@example.com",
            contrasena: "password123",
            nombre: "Test User",
            nombreUsuario: "testuser",
            rut: "12345678-9"
        }];
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosMock));

        render(
            <MemoryRouter>
                <Dropdown {...defaultProps} />
            </MemoryRouter>
        );

        const loginButton = screen.getByTestId('login-dropdown-toggle');
        fireEvent.click(loginButton);

        fireEvent.change(screen.getByTestId('loginEmail'), {
            target: { value: "test@example.com" }
        });
        fireEvent.change(screen.getByTestId('loginPassword'), {
            target: { value: "password123" }
        });

        const submitButton = screen.getByTestId('login-submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnLogin).toHaveBeenCalledWith(expect.objectContaining({
                correo: "test@example.com",
                nombre: "Test User"
            }));
        });
    });

    it("muestra error con credenciales incorrectas", async () => {
        render(
            <MemoryRouter>
                <Dropdown {...defaultProps} />
            </MemoryRouter>
        );

        const loginButton = screen.getByTestId('login-dropdown-toggle');
        fireEvent.click(loginButton);

        fireEvent.change(screen.getByTestId('loginEmail'), {
            target: { value: "wrong@email.com" }
        });
        fireEvent.change(screen.getByTestId('loginPassword'), {
            target: { value: "wrongpassword" }
        });

        const submitButton = screen.getByTestId('login-submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
        });
    });
});