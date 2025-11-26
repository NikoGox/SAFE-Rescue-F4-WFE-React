// Contactanos.Test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Contactanos from "../pages/Contactanos";
import React from 'react';

// Mocks globales
let mockIsLoggedIn = false;
let mockAuthData: any = null;

// Mock de useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
    authData: mockAuthData,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock de NotificacionService - SIN VARIABLES EXTERNAS
vi.mock('../service/services/comunicaciones/NotificacionService', () => {
  const mockCrearNotificacion = vi.fn();
  return {
    default: {
      crearNotificacion: mockCrearNotificacion,
    },
    // Exportar el mock para usarlo en los tests
    __mockCrearNotificacion: mockCrearNotificacion,
  };
});

// Mock de Validaciones - SIN VARIABLES EXTERNAS
vi.mock('../utils/Validaciones', () => {
  const validateEmail = vi.fn();
  const validatePhoneNumber = vi.fn();
  const validateNameLettersOnly = vi.fn();
  const validateIsRequired = vi.fn();
  const validateMessage = vi.fn();

  return {
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired,
    validateMessage,
    // Exportar los mocks para usarlos en los tests
    __mocks: {
      validateEmail,
      validatePhoneNumber,
      validateNameLettersOnly,
      validateMessage,
    }
  };
});

// Mock de FormField
vi.mock('../components/Formulario', () => ({
  default: ({
    id,
    label,
    value = '',
    onChange,
    onBlur,
    error,
    type = "text",
    disabled,
    dataTestId,
    isTextArea = false
  }: any) => {
    const Component = isTextArea ? 'textarea' : 'input';
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <Component
          id={id}
          data-testid={dataTestId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          disabled={disabled}
          placeholder={label}
        />
        {error && <span data-testid={`error-${id}`}>{error}</span>}
      </div>
    );
  }
}));

// Mock de CSS
vi.mock('../pages/Contactanos.module.css', () => ({
  default: {
    contactPageContainer: 'contactPageContainer',
    contenedorPrincipal: 'contenedorPrincipal',
    seccionFormulario: 'seccionFormulario',
    logoFormulario: 'logoFormulario',
    tituloFormulario: 'tituloFormulario',
    subtituloFormulario: 'subtituloFormulario',
    form: 'form',
    checkboxContainer: 'checkboxContainer',
    authError: 'authError',
  },
}));

// Mock de imagen
vi.mock("../assets/sr_logo.png", () => ({ default: "test-logo.png" }));

// Importar los servicios mockeados para acceder a los mocks
import NotificacionService from "../service/services/comunicaciones/NotificacionService";
import * as Validaciones from '../utils/Validaciones';

// Type assertion para acceder a los mocks exportados
const mockNotificacionService = NotificacionService as any;
const mockValidaciones = Validaciones as any;

describe("Contactanos - Tests Completos", () => {
  // Acceder a los mocks desde los objetos importados
  const mockCrearNotificacion = mockNotificacionService.__mockCrearNotificacion;
  const validateNameLettersOnly = mockValidaciones.__mocks?.validateNameLettersOnly || mockValidaciones.validateNameLettersOnly;
  const validateEmail = mockValidaciones.__mocks?.validateEmail || mockValidaciones.validateEmail;
  const validatePhoneNumber = mockValidaciones.__mocks?.validatePhoneNumber || mockValidaciones.validatePhoneNumber;
  const validateMessage = mockValidaciones.__mocks?.validateMessage || mockValidaciones.validateMessage;

  beforeEach(() => {
    mockIsLoggedIn = false;
    mockAuthData = null;
    vi.clearAllMocks();

    // Configurar mocks de validaciones para éxito por defecto
    validateNameLettersOnly.mockReturnValue(null);
    validateEmail.mockReturnValue(null);
    validatePhoneNumber.mockReturnValue(null);
    validateMessage.mockReturnValue(null);
  });

  // =========================================================================
  // TESTS DE RENDERIZADO BÁSICO
  // =========================================================================
  describe("Renderizado básico", () => {
    it("1. Renderiza correctamente todos los elementos del formulario", () => {
      render(<Contactanos />);

      expect(screen.getByTestId("contact-page-container")).toBeInTheDocument();
      expect(screen.getByTestId("contact-logo")).toBeInTheDocument();
      expect(screen.getByTestId("contact-title")).toHaveTextContent("Contáctanos");

      expect(screen.getByTestId("contact-nombre")).toBeInTheDocument();
      expect(screen.getByTestId("contact-email")).toBeInTheDocument();
      expect(screen.getByTestId("contact-telefono")).toBeInTheDocument();
      expect(screen.getByTestId("contact-mensaje")).toBeInTheDocument();

      expect(screen.getByTestId("contact-submit-button")).toBeInTheDocument();
    });

    it("2. El formulario principal existe y tiene los campos correctos", () => {
      render(<Contactanos />);

      expect(screen.getByTestId("contact-form")).toBeInTheDocument();

      const form = screen.getByTestId("contact-form");
      expect(form).toContainElement(screen.getByTestId("contact-nombre"));
      expect(form).toContainElement(screen.getByTestId("contact-email"));
      expect(form).toContainElement(screen.getByTestId("contact-telefono"));
      expect(form).toContainElement(screen.getByTestId("contact-mensaje"));
      expect(form).toContainElement(screen.getByTestId("contact-submit-button"));
    });

    it("3. No muestra checkbox de perfil cuando usuario no está logueado", () => {
      render(<Contactanos />);

      expect(screen.queryByTestId("autofill-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("autofill-checkbox")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // TESTS DE USUARIO LOGUEADO
  // =========================================================================
  describe("Comportamiento con usuario logueado", () => {
    beforeEach(() => {
      mockIsLoggedIn = true;
      mockAuthData = {
        idUsuario: 1,
        nombre: "María González",
        correo: "maria@ejemplo.com",
        telefono: "912345678"
      };
    });

    it("4. Muestra checkbox de perfil cuando usuario está logueado", () => {
      render(<Contactanos />);

      expect(screen.getByTestId("autofill-container")).toBeInTheDocument();
      expect(screen.getByTestId("autofill-checkbox")).toBeInTheDocument();
      expect(screen.getByTestId("autofill-label")).toHaveTextContent("Usar mis datos de perfil");
    });

    it("5. Precarga datos del perfil cuando se activa el checkbox", async () => {
      render(<Contactanos />);

      // Activar checkbox
      fireEvent.click(screen.getByTestId("autofill-checkbox"));

      // Verificar que los campos se llenaron con datos del perfil
      await waitFor(() => {
        expect(screen.getByTestId("contact-nombre")).toHaveValue("María González");
        expect(screen.getByTestId("contact-email")).toHaveValue("maria@ejemplo.com");
        expect(screen.getByTestId("contact-telefono")).toHaveValue("9 1234 5678");
      });
    });
  });

  // =========================================================================
  // TESTS DE VALIDACIÓN - CAMPOS VACÍOS
  // =========================================================================
  describe("Validación de formulario - Campos vacíos", () => {
    beforeEach(() => {
      // Configurar validaciones para fallar (campos vacíos)
      validateNameLettersOnly.mockReturnValue("El nombre es obligatorio");
      validateEmail.mockReturnValue("El correo es obligatorio");
      validatePhoneNumber.mockReturnValue(null); // Teléfono es opcional
      validateMessage.mockReturnValue("El mensaje es obligatorio");
    });

    it("6. Muestra errores cuando se envían campos vacíos", async () => {
      render(<Contactanos />);

      // Enviar formulario sin llenar campos
      fireEvent.click(screen.getByTestId("contact-submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-nombre")).toBeInTheDocument();
        expect(screen.getByTestId("error-correo")).toBeInTheDocument();
        expect(screen.getByTestId("error-mensaje")).toBeInTheDocument();

        // Verificar mensaje de error general
        expect(screen.getByTestId("contact-message-box")).toBeInTheDocument();
        expect(screen.getByTestId("contact-message-box")).toHaveTextContent("corrige los errores");
      });
    });

    it("7. Muestra error específico para nombre vacío", async () => {
      validateNameLettersOnly.mockReturnValue("El nombre completo es obligatorio");

      render(<Contactanos />);
      fireEvent.click(screen.getByTestId("contact-submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-nombre")).toHaveTextContent("El nombre completo es obligatorio");
      });
    });
  });
})