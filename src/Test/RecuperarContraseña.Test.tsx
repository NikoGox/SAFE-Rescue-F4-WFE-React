import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../pages/RecuperarContrasena";

describe("Recuperar Contraseña Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("muestra el formulario de recuperación", () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        expect(screen.getByTestId('recovery-email')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it("valida campo de correo vacío", async () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        // Primero ingresamos un valor y luego lo borramos para activar la validación
        const emailInput = screen.getByTestId('recovery-email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(emailInput, { target: { value: '' } });

        // Hacemos que el input pierda el foco para activar la validación
        fireEvent.blur(emailInput);

        await waitFor(() => {
            const errorMessage = screen.getByTestId('email-error');
            expect(errorMessage).toHaveTextContent('El correo electrónico es obligatorio.');
        }, { timeout: 3000 });
    });

    it("valida formato de correo inválido", async () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByTestId('recovery-email');
        fireEvent.change(emailInput, { target: { value: 'correoinvalido' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('email-error')).toHaveTextContent(/formato de correo electrónico inválido/i);
        }, { timeout: 3000 });
    });

    it("muestra mensaje de éxito al enviar correo válido", async () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByTestId('recovery-email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
            expect(screen.getByTestId('back-to-login')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it("maneja estado de carga durante el envío", async () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByTestId('recovery-email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        expect(submitButton).toHaveTextContent('Enviando...');
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it("deshabilita el botón cuando el campo está vacío", () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).toBeDisabled();

        const emailInput = screen.getByTestId('recovery-email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(submitButton).not.toBeDisabled();
    });
});