import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Donar from "../pages/Donar";
import React from 'react';

// MOCKS GLOBALES
let mockIsLoggedIn = false;
let mockAuthData: any = null;

// Mock de alert usando window
const mockAlert = vi.fn();
window.alert = mockAlert;

// Mock de useAuth - SIMPLE
vi.mock('../components/UseAuth', () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
    authData: mockAuthData,
    loading: false,
    userName: mockAuthData?.nombre || '',
    profileImage: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuthStatus: vi.fn(),
  }),
}));

// Mock simple de FormField
vi.mock('../components/Formulario', () => ({
  default: (props: any) => (
    <div>
      <input 
        data-testid={props.dataTestId} 
        value={props.value || ''}
      />
      {props.error && <span data-testid={`error-${props.id}`}>{props.error}</span>}
    </div>
  )
}));

// Mock de CSS
vi.mock('../pages/Donar.css', () => ({}));

// Mock de react-icons
vi.mock('react-icons/fa', () => ({
  FaDollarSign: () => <span data-testid="icon-dollar">$</span>,
  FaMoneyBillWave: () => <span data-testid="icon-bill">$$</span>,
  FaCoins: () => <span data-testid="icon-coins">¢</span>,
  FaHandHoldingUsd: () => <span data-testid="icon-hand">H</span>,
  FaPlus: () => <span data-testid="icon-plus">+</span>,
}));

// Mock de imagen
vi.mock("../assets/sr_logo.png", () => ({
  default: "test-logo.png"
}));

describe("Componente Donar", () => {
  beforeEach(() => {
    mockIsLoggedIn = false;
    mockAuthData = null;
    vi.clearAllMocks();
  });

  // =========================================================================
  // TEST 1: Renderizado básico de pantalla inicial
  // =========================================================================
  it("1. Renderiza correctamente la pantalla inicial de montos", () => {
    render(<Donar />);
    
    // Verificar que está en pantalla de monto
    expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
    
    // Verificar elementos principales
    expect(screen.getByText(/Aporta ahora/i)).toBeInTheDocument();
    expect(screen.getByText(/Cada donación nos ayuda/i)).toBeInTheDocument();
    
    // Verificar que los botones de monto existen
    expect(screen.getByTestId('monto-btn-5000')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-10000')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-20000')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-50000')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-100000')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-otro')).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 2: Verificar estructura de botones de monto
  // =========================================================================
  it("2. Los botones de monto tienen la estructura correcta", () => {
    render(<Donar />);

    const monto5000 = screen.getByTestId('monto-btn-5000');
    const monto10000 = screen.getByTestId('monto-btn-10000');
    
    // Verificar que son botones
    expect(monto5000).toBeInstanceOf(HTMLButtonElement);
    expect(monto10000).toBeInstanceOf(HTMLButtonElement);
    
    // Verificar que están habilitados
    expect(monto5000).not.toBeDisabled();
    expect(monto10000).not.toBeDisabled();
  });

  // =========================================================================
  // TEST 3: Verificar que no hay elementos de otras pantallas inicialmente
  // =========================================================================
  it("3. No muestra elementos de otras pantallas inicialmente", () => {
    render(<Donar />);

    // Verificar que solo la pantalla de monto está visible
    expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
    
    // Verificar que otras pantallas NO están visibles
    expect(screen.queryByTestId('pantalla-formulario')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pantalla-confirmacion')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pantalla-redirigiendo')).not.toBeInTheDocument();
    
    // Verificar que no hay elementos de formulario inicialmente
    expect(screen.queryByTestId('input-nombre')).not.toBeInTheDocument();
    expect(screen.queryByTestId('input-email')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-continuar')).not.toBeInTheDocument();
  });

  // =========================================================================
  // TEST 4: Verificar textos y contenido estático
  // =========================================================================
  it("4. Muestra los textos y contenido estático correctos", () => {
    render(<Donar />);

    // Verificar textos principales
    expect(screen.getByText(/Aporta ahora/i)).toBeInTheDocument();
    expect(screen.getByText(/Cada donación nos ayuda/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Gracias por tu apoyo/i)).toBeInTheDocument();
    
    // Verificar montos en los botones
    expect(screen.getByText(/\$5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$10\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$20\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$50\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Otro monto/)).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 5: Verificar que el logo se renderiza correctamente
  // =========================================================================
  it("5. Renderiza el logo correctamente", () => {
    render(<Donar />);

    const logo = screen.getByAltText('SAFE Rescue Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'test-logo.png');
  });

  // =========================================================================
  // TEST 6: Verificar estructura cuando usuario está logueado
  // =========================================================================
  it("6. Muestra estructura básica cuando usuario está logueado", () => {
    // Configurar usuario logueado
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: 'Usuario Test',
      email: 'usuario@test.com',
      telefono: '911223344'
    };

    render(<Donar />);

    // Verificar que la pantalla de monto se renderiza normalmente
    expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
    expect(screen.getByTestId('monto-btn-5000')).toBeInTheDocument();
    
    // El checkbox de perfil solo aparece en el formulario, no en la pantalla de monto
    expect(screen.queryByTestId('checkbox-usar-perfil')).not.toBeInTheDocument();
  });
});