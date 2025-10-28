import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Contactanos from "../pages/Contactanos";
import React from 'react';

// Mocks MÍNIMOS que sabemos que funcionan
vi.mock('../components/UseAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    authData: null,
    loading: false,
    userName: '',
    profileImage: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/Formulario', () => ({
  default: (props: any) => (
    <div>
      <input data-testid={props.dataTestId} />
      {props.error && <span data-testid={`error-${props.id}`}>{props.error}</span>}
    </div>
  )
}));

vi.mock('../utils/Validaciones', () => ({
  validateEmail: () => null,
  validatePhoneNumber: () => null,
  validateNameLettersOnly: () => null,
  validateIsRequired: () => null,
  validateMessage: () => null,
}));

vi.mock("../assets/sr_logo.png", () => ({ default: "test-logo.png" }));

describe("Contactanos - Solo Tests Básicos", () => {
  // =========================================================================
  // TEST 1: Renderizado básico (ESTE SÍ FUNCIONA)
  // =========================================================================
  it("1. Renderiza correctamente todos los elementos del formulario", () => {
    render(<Contactanos />);

    expect(screen.getByTestId("contact-page-container")).toBeInTheDocument();
    expect(screen.getByTestId("contact-logo")).toBeInTheDocument();
    expect(screen.getByTestId("contact-title")).toHaveTextContent("Contáctanos");
    
    expect(screen.getByTestId("contact-nombre")).toBeInTheDocument();
    expect(screen.getByTestId("contact-email")).toBeInTheDocument();
    expect(screen.getByTestId("contact-telefono")).toBeInTheDocument();
    expect(screen.getByTestId("contact-direccion")).toBeInTheDocument();
    expect(screen.getByTestId("contact-mensaje")).toBeInTheDocument();
    
    expect(screen.getByTestId("contact-submit-button")).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 2: Verificar que el formulario existe
  // =========================================================================
  it("2. El formulario principal existe y tiene los campos", () => {
    render(<Contactanos />);

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    
    // Verificar que todos los campos están dentro del formulario
    const form = screen.getByTestId("contact-form");
    expect(form).toContainElement(screen.getByTestId("contact-nombre"));
    expect(form).toContainElement(screen.getByTestId("contact-email"));
    expect(form).toContainElement(screen.getByTestId("contact-telefono"));
    expect(form).toContainElement(screen.getByTestId("contact-direccion"));
    expect(form).toContainElement(screen.getByTestId("contact-mensaje"));
    expect(form).toContainElement(screen.getByTestId("contact-submit-button"));
  });

  // =========================================================================
  // TEST 3: Verificar textos estáticos
  // =========================================================================
  it("3. Muestra los textos correctos en la interfaz", () => {
    render(<Contactanos />);

    expect(screen.getByText(/Envíanos un mensaje y te responderemos a la brevedad/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviar Mensaje/i)).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 4: Verificar que no hay errores visibles inicialmente
  // =========================================================================
  it("4. No muestra errores de validación inicialmente", () => {
    render(<Contactanos />);

    // Verificar que no hay elementos de error visibles
    expect(screen.queryByTestId("error-nombre")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-telefono")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-direccion")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-mensaje")).not.toBeInTheDocument();
    
    // Verificar que no hay mensaje de error general
    expect(screen.queryByTestId("contact-message-box")).not.toBeInTheDocument();
  });
});