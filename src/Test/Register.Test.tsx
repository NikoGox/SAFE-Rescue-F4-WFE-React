// src/Test/Register.Test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Registrarse from "../pages/Registrarse";

// MOCKS ESENCIALES
// 1. Mock de 'react-router-dom' para la navegación (useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    // CORRECCIÓN de tipado: Usamos 'as any' para evitar el error de spread types en TS
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        MemoryRouter: actual.MemoryRouter, // Usamos MemoryRouter real para envolver el componente
    };
});

// Datos de prueba para un registro exitoso
const validFormData = {
    nombre: "Juan Pérez",
    rut: "11.111.111-1",
    email: "juan.perez@example.com", // Correo que no existe previamente
    direccion: "Calle Ejemplo 123",
    telefono: "912345678",
    nombreUsuario: "juanperez_nuevo", // Nombre de usuario que no existe previamente
    contrasena: "Password123.",
    confirmarContrasena: "Password123.",
};

// Función de ayuda para llenar el formulario
const fillForm = (fields = validFormData) => {
    fireEvent.change(screen.getByTestId('register-nombre'), { target: { value: fields.nombre } });
    fireEvent.change(screen.getByTestId('register-rut'), { target: { value: fields.rut } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: fields.email } });
    fireEvent.change(screen.getByTestId('register-direccion'), { target: { value: fields.direccion } });
    fireEvent.change(screen.getByTestId('register-telefono'), { target: { value: fields.telefono } });
    fireEvent.change(screen.getByTestId('register-nombreUsuario'), { target: { value: fields.nombreUsuario } });
    fireEvent.change(screen.getByTestId('register-contrasena'), { target: { value: fields.contrasena } });
    fireEvent.change(screen.getByTestId('register-confirmarContrasena'), { target: { value: fields.confirmarContrasena } });

    // 1. Obtener el elemento
    const terminos = screen.getByTestId('register-terms');

    // 2. Aplicar la aserción de tipo a HTMLInputElement (usando 'as')
    const terminosCheckbox = terminos as HTMLInputElement;

    // 3. Ahora puedes acceder a 'checked' de forma segura
    if (!terminosCheckbox.checked) {
        fireEvent.click(terminosCheckbox);
    }
};


describe("Componente Registrarse", () => {
    beforeEach(() => {
        // Limpiamos los mocks y el localStorage antes de cada prueba
        vi.clearAllMocks();
        localStorage.clear();

        // Renderizamos el componente dentro de MemoryRouter y con el mock de useNavigate
        render(
            <MemoryRouter>
                <Registrarse />
            </MemoryRouter>
        );
    });

    // --- Pruebas Básicas ---

    it("1. Muestra todos los campos del formulario", () => {
        // Se mantiene tu prueba original, la lógica es correcta
        expect(screen.getByTestId('register-nombre')).toBeInTheDocument();
        expect(screen.getByTestId('register-rut')).toBeInTheDocument();
        expect(screen.getByTestId('register-email')).toBeInTheDocument();
        expect(screen.getByTestId('register-direccion')).toBeInTheDocument();
        expect(screen.getByTestId('register-telefono')).toBeInTheDocument();
        expect(screen.getByTestId('register-nombreUsuario')).toBeInTheDocument();
        expect(screen.getByTestId('register-contrasena')).toBeInTheDocument();
        expect(screen.getByTestId('register-confirmarContrasena')).toBeInTheDocument();
        // Agregamos la verificación del checkbox de términos y el botón de submit
        expect(screen.getByTestId('register-terms')).toBeInTheDocument();
        expect(screen.getByTestId('register-submit')).toBeInTheDocument();
    });

    it("2. Valida campos vacíos", async () => {
        const submitButton = screen.getByTestId('register-submit');

        // Simular clic sin llenar nada
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Utilizamos el texto /es obligatorio/i o /requerido/i (depende de tu componente)
            const errors = screen.queryAllByText(/obligatorio|requerido/i);

            // Esperamos que haya al menos 5 errores (varía según tu componente)
            expect(errors.length).toBeGreaterThanOrEqual(5);

            // Verificamos un mensaje específico de error de 'Términos' si es requerido
            expect(screen.getByText(/Debe aceptar los términos y condiciones/i)).toBeInTheDocument();
        });
    });

    // --- Pruebas de Lógica de Negocio (Registro Exitoso) ---

    it("3. Maneja el registro exitoso y redirige", async () => {
        fillForm(validFormData);

        const submitButton = screen.getByTestId('register-submit');
        fireEvent.click(submitButton);

        // 1. Verificar que no hay errores de validación después del submit
        await waitFor(() => {
            const errors = screen.queryAllByText(/inválido|obligatorio|coinciden/i);
            expect(errors.length).toBe(0);
        });

        // 2. Verificar que se muestra el mensaje de éxito
        await waitFor(() => {
            expect(screen.getByText("¡Registro exitoso! Serás redirigido para iniciar sesión.")).toBeInTheDocument();
        });


        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);

            expect(mockNavigate).toHaveBeenCalledWith('/');
        }, { timeout: 4000 });

        // 4. Verificar que el usuario fue guardado en localStorage
        const storedUsers = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
        expect(storedUsers.length).toBe(1);
        // CORRECCIÓN: Se usa 'email' en lugar de 'correo' para la aserción
        expect(storedUsers[0].email).toBe(validFormData.email);
        expect(storedUsers[0].nombreUsuario).toBe(validFormData.nombreUsuario);
    });

    // --- Pruebas de Lógica de Negocio (Usuario ya existe) ---

    it("4. Muestra error cuando el usuario ya existe (correo o nombre de usuario)", async () => {

        // La limpieza de localStorage.clear() ya la hace beforeEach.

        const existingUser = {
            nombre: "Usuario Existente",
            rut: "99.999.999-9",
            // Usamos un correo que será el punto de conflicto
            email: validFormData.email,
            direccion: "Otra Calle",
            telefono: "900000000",
            nombreUsuario: "usuario_existente",
            contrasena: "password2024",
        };

        // 1. Pre-carga del usuario existente en localStorage
        localStorage.setItem('usuariosRegistrados', JSON.stringify([
            // Se simulan los datos de un usuario previamente registrado
            { ...existingUser, email: existingUser.email, confirmarContrasena: existingUser.contrasena, terminos: true }
        ]));

        // 🛑 CORRECCIÓN CLAVE: ELIMINAMOS EL BLOQUE DE 'render' DUPLICADO.
        // Usamos la instancia de <Registrarse /> ya renderizada en beforeEach.

        // 2. Llenamos el formulario con un NUEVO usuario que usa el CORREO existente
        const dataWithExistingEmail = {
            ...validFormData,
            email: existingUser.email, // <-- Correo que ya está en localStorage
            nombreUsuario: "nuevo_username", // Nombre de usuario diferente
        };

        fillForm(dataWithExistingEmail);

        const submitButton = screen.getByTestId('register-submit');
        fireEvent.click(submitButton);

        // 3. Esperar y verificar el mensaje de error de conflicto (asíncrono)
        await waitFor(() => {
            // CORRECCIÓN: Usamos el mensaje de error preciso para el conflicto de email
            const errorMessage = screen.getByText("El correo electrónico ya está registrado.");
            expect(errorMessage).toBeInTheDocument();

            // 4. Aseguramos que NO hubo redirección
            expect(mockNavigate).not.toHaveBeenCalled();
        }, { timeout: 2000 });
    });
});