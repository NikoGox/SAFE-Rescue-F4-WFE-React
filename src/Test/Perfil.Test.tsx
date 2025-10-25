import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Perfil from "../pages/Perfil"; 
import type{ UserData } from "../types/UserType"; 

// MOCK DE DATOS
const MOCK_LOGGED_USER = {
    nombre: "Ana María",
    // Importante: El componente Perfil.tsx usa 'data.correo' para cargar el estado 'userData.email'.
    // Los datos en localStorage deben usar 'correo' y 'nombreUsuario'.
    correo: "ana.maria@ejemplo.com", 
    telefono: "987654321",
    direccion: "Avenida Principal 456",
    rut: "22.222.222-2",
    nombreUsuario: "anamaria123",
    contrasena: "ContrasenaSegura", // Datos adicionales no usados en UserData, pero que pueden estar en storage
};

// Datos para una actualización exitosa
const NEW_VALID_DATA = {
    nombre: "Ana María Soto",
    email: "ana.soto@nuevo.cl",
    telefono: "911112222",
    direccion: "Calle Falsa 123",
};

// Función de ayuda para llenar los campos en modo edición
const fillProfileForm = (fields: Partial<UserData>) => {
    if (fields.nombre) {
        fireEvent.change(screen.getByTestId('perfil-nombre'), { target: { value: fields.nombre } });
    }
    if (fields.email) {
        fireEvent.change(screen.getByTestId('perfil-email'), { target: { value: fields.email } });
    }
    if (fields.telefono) {
        fireEvent.change(screen.getByTestId('perfil-telefono'), { target: { value: fields.telefono } });
    }
    if (fields.direccion) {
        fireEvent.change(screen.getByTestId('perfil-direccion'), { target: { value: fields.direccion } });
    }
};

describe("Componente Perfil", () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // --- PRUEBA 1: Carga de datos y modo de visualización inicial ---
    it("1. Carga los datos del usuario logueado desde localStorage y muestra el botón Editar", () => {
        // Pre-carga el usuario en localStorage
        localStorage.setItem('usuarioLogueado', JSON.stringify(MOCK_LOGGED_USER));

        render(<Perfil />);

        // Verificar que los campos se cargan y están deshabilitados
        expect(screen.getByTestId('perfil-nombre')).toHaveValue(MOCK_LOGGED_USER.nombre);
        expect(screen.getByTestId('perfil-email')).toHaveValue(MOCK_LOGGED_USER.correo); // OJO: El componente mapea 'correo' a 'email'
        expect(screen.getByTestId('perfil-rut')).toHaveValue(MOCK_LOGGED_USER.rut);
        expect(screen.getByTestId('perfil-nombre')).toBeDisabled();

        // Verificar que el botón de Edición está visible
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
        expect(screen.queryByTestId('perfil-save-button')).not.toBeInTheDocument();
    });

    // --- PRUEBA 2: Alternancia a modo edición y cancelación ---
    it("2. Alterna entre modo visualización y edición, y cancela correctamente", () => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(MOCK_LOGGED_USER));
        render(<Perfil />);

        const editButton = screen.getByTestId('perfil-edit-button');
        fireEvent.click(editButton);

        // A. Verificar MODO EDICIÓN
        const saveButton = screen.getByTestId('perfil-save-button');
        const cancelButton = screen.getByTestId('perfil-cancel-button');
        
        expect(saveButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
        expect(screen.getByTestId('perfil-nombre')).not.toBeDisabled();

        // Modificar un campo
        fireEvent.change(screen.getByTestId('perfil-nombre'), { target: { value: "Nuevo Nombre Temporal" } });
        expect(screen.getByTestId('perfil-nombre')).toHaveValue("Nuevo Nombre Temporal");

        // B. CANCELAR EDICIÓN
        fireEvent.click(cancelButton);

        // Verificar MODO VISUALIZACIÓN
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
        expect(screen.queryByTestId('perfil-save-button')).not.toBeInTheDocument();

        // Verificar que el valor revierte al original
        expect(screen.getByTestId('perfil-nombre')).toHaveValue(MOCK_LOGGED_USER.nombre);
        expect(screen.getByTestId('perfil-nombre')).toBeDisabled();
    });

    // --- PRUEBA 3: Guardado exitoso y actualización de localStorage ---
    it("3. Permite la edición exitosa y guarda los cambios en localStorage", async () => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(MOCK_LOGGED_USER));
        render(<Perfil />);

        fireEvent.click(screen.getByTestId('perfil-edit-button'));

        // Llenar con datos válidos
        fillProfileForm(NEW_VALID_DATA);

        fireEvent.click(screen.getByTestId('perfil-save-button'));

        await waitFor(() => {
            // 1. Verifica el mensaje de éxito
            expect(screen.getByTestId('perfil-message')).toHaveTextContent('Cambios guardados exitosamente.');
            // 2. Vuelve al modo visualización
            expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
            // 3. Los campos reflejan los nuevos valores
            expect(screen.getByTestId('perfil-email')).toHaveValue(NEW_VALID_DATA.email);
            // 4. Los campos están deshabilitados
            expect(screen.getByTestId('perfil-email')).toBeDisabled();
        });

        // 5. Verifica que localStorage se actualizó correctamente
        const updatedStorage = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

        expect(updatedStorage.nombre).toBe(NEW_VALID_DATA.nombre);
        // El componente guarda en 'correo', no en 'email'
        expect(updatedStorage.correo).toBe(NEW_VALID_DATA.email); 
        // El RUT y nombreUsuario se mantienen sin cambios
        expect(updatedStorage.rut).toBe(MOCK_LOGGED_USER.rut);
        expect(updatedStorage.nombreUsuario).toBe(MOCK_LOGGED_USER.nombreUsuario);
    });
    
    // --- PRUEBA 4: Fallo de validación al guardar ---
    it("4. Muestra errores de validación y mantiene el botón Guardar deshabilitado", async () => {
        localStorage.setItem('usuarioLogueado', JSON.stringify(MOCK_LOGGED_USER));
        render(<Perfil />);

        fireEvent.click(screen.getByTestId('perfil-edit-button'));

        // Intentar ingresar datos inválidos: nombre con números y email incorrecto
        const invalidData = {
            nombre: "Ana123",
            email: "correo-invalido",
            rut: "11111111-1" // RUT inválido, ya que '11111111-1' no pasa el dígito verificador.
        };
        fillProfileForm(invalidData);
        
        // Simular que el usuario sale de los campos para activar el handleBlur
        fireEvent.blur(screen.getByTestId('perfil-nombre'));
        fireEvent.blur(screen.getByTestId('perfil-email'));
        fireEvent.blur(screen.getByTestId('perfil-rut'));

        await waitFor(() => {
            // Verificar mensajes de error
            expect(screen.getByText(/solo debe contener letras/i)).toBeInTheDocument();
            expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
            expect(screen.getByText(/RUT inválido/i)).toBeInTheDocument();
            
            // Verificar que el botón de Guardar está deshabilitado
            const saveButton = screen.getByTestId('perfil-save-button');
            expect(saveButton).toBeDisabled();
        });

        // Intentar hacer submit (debería fallar la validación final también)
        fireEvent.click(screen.getByTestId('perfil-save-button'));
        
        // Debería seguir deshabilitado y no guardar
        expect(screen.getByTestId('perfil-save-button')).toBeDisabled();
        expect(localStorage.getItem('usuarioLogueado')).not.toContain(invalidData.nombre);
    });
});