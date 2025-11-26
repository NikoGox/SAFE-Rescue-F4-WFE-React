// Donar.Test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Donar from "../pages/Donar";
import React from 'react';

// MOCKS GLOBALES
let mockIsLoggedIn = false;
let mockAuthData: any = null;

// Mock de alert usando window
const mockAlert = vi.fn();
window.alert = mockAlert;

// Mock de prompt
const mockPrompt = vi.fn();
window.prompt = mockPrompt;

// Mock de useAuth - debe estar primero y ser simple
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
    authData: mockAuthData,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock de DonacionService - usar vi.fn() directamente en el mock
vi.mock('../service/services/donaciones/DonacionService', () => ({
  default: {
    procesarDonacionUniversal: vi.fn(),
    crearDonacionConDonanteFijo: vi.fn(),
  },
}));

// Importar los mocks después de definir los mocks
import DonacionService from "../service/services/donaciones/DonacionService";

// Mock de FormField mejorado
vi.mock('../components/Formulario', () => ({
  default: ({
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    type = "text",
    required,
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
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          required={required}
          disabled={disabled}
          placeholder={label}
        />
        {error && <span data-testid={`error-${id}`} className="error">{error}</span>}
      </div>
    );
  }
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

// Obtener referencias a los mocks
const mockProcesarDonacionUniversal = DonacionService.procesarDonacionUniversal as jest.MockedFunction<typeof DonacionService.procesarDonacionUniversal>;
const mockCrearDonacionConDonanteFijo = DonacionService.crearDonacionConDonanteFijo as jest.MockedFunction<typeof DonacionService.crearDonacionConDonanteFijo>;

describe("Componente Donar - Tests Completos", () => {
  beforeEach(() => {
    mockIsLoggedIn = false;
    mockAuthData = null;
    vi.clearAllMocks();
    mockProcesarDonacionUniversal.mockReset();
    mockCrearDonacionConDonanteFijo.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // TESTS DE RENDERIZADO BÁSICO
  // =========================================================================
  describe("Renderizado básico", () => {
    it("1. Renderiza correctamente la pantalla inicial de montos", () => {
      render(<Donar />);

      expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
      expect(screen.getByText(/Aporta ahora/i)).toBeInTheDocument();
      expect(screen.getByText(/Cada donación nos ayuda/i)).toBeInTheDocument();

      // Verificar botones de monto
      expect(screen.getByTestId('monto-btn-5000')).toBeInTheDocument();
      expect(screen.getByTestId('monto-btn-10000')).toBeInTheDocument();
      expect(screen.getByTestId('monto-btn-20000')).toBeInTheDocument();
      expect(screen.getByTestId('monto-btn-50000')).toBeInTheDocument();
      expect(screen.getByTestId('monto-btn-100000')).toBeInTheDocument();
      expect(screen.getByTestId('monto-btn-otro')).toBeInTheDocument();
    });

    it("2. No muestra elementos de otras pantallas inicialmente", () => {
      render(<Donar />);

      expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
      expect(screen.queryByTestId('pantalla-formulario')).not.toBeInTheDocument();
      expect(screen.queryByTestId('input-nombre')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // TESTS DE NAVEGACIÓN ENTRE PANTALLAS
  // =========================================================================
  describe("Navegación entre pantallas", () => {
    it("3. Navega a formulario al seleccionar un monto", () => {
      render(<Donar />);

      // Seleccionar monto
      fireEvent.click(screen.getByTestId('monto-btn-5000'));

      // Verificar que estamos en pantalla de formulario
      expect(screen.getByTestId('pantalla-formulario')).toBeInTheDocument();
      expect(screen.getByTestId('monto-seleccionado')).toHaveTextContent('$5.000');
    });

    it("4. Permite volver a pantalla de monto desde formulario", () => {
      render(<Donar />);

      // Ir a formulario
      fireEvent.click(screen.getByTestId('monto-btn-5000'));
      expect(screen.getByTestId('pantalla-formulario')).toBeInTheDocument();

      // Volver a monto haciendo click en el monto
      fireEvent.click(screen.getByTestId('monto-formulario'));

      expect(screen.getByTestId('pantalla-monto')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TESTS DE VALIDACIÓN DE FORMULARIO - CAMPOS VACÍOS
  // =========================================================================
  describe("Validación de formulario - Campos vacíos", () => {
    beforeEach(() => {
      render(<Donar />);
      fireEvent.click(screen.getByTestId('monto-btn-5000'));
    });

    it("5. Muestra error cuando nombre está vacío", async () => {
      // Dejar nombre vacío y llenar otros campos requeridos
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'test@ejemplo.com' }
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('error-nombre')).toBeInTheDocument();
        expect(screen.getByTestId('error-nombre')).toHaveTextContent('El nombre completo es obligatorio');
      });
    });

    it("6. Muestra error cuando correo está vacío", async () => {
      // Llenar nombre pero dejar correo vacío
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'Juan Pérez' }
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('error-correo')).toBeInTheDocument();
        expect(screen.getByTestId('error-correo')).toHaveTextContent('El correo electrónico es obligatorio');
      });
    });

    it("7. Muestra error cuando correo tiene formato inválido", async () => {
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'Juan Pérez' }
      });
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'correo-invalido' }
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('error-correo')).toBeInTheDocument();
        expect(screen.getByTestId('error-correo')).toHaveTextContent('Formato de correo inválido');
      });
    });

    it("8. Muestra error cuando teléfono es incompleto", async () => {
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'Juan Pérez' }
      });
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'test@ejemplo.com' }
      });
      fireEvent.change(screen.getByTestId('input-telefono'), {
        target: { value: '9123' } // Teléfono incompleto
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('error-telefono')).toBeInTheDocument();
        expect(screen.getByTestId('error-telefono')).toHaveTextContent('El teléfono debe tener 9 dígitos');
      });
    });

    it("9. Muestra error cuando homenaje está activo pero sin detalle", async () => {
      // Llenar campos básicos
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'Juan Pérez' }
      });
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'test@ejemplo.com' }
      });

      // Activar homenaje pero no llenar detalle
      fireEvent.click(screen.getByTestId('checkbox-homenaje'));

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('error-detalleHomenaje')).toBeInTheDocument();
        expect(screen.getByTestId('error-detalleHomenaje')).toHaveTextContent('El detalle del homenaje es obligatorio');
      });
    });
  });

  // =========================================================================
  // TESTS DE FORMULARIO VÁLIDO Y CONFIRMACIÓN
  // =========================================================================
  describe("Formulario válido y confirmación", () => {
    it("10. Navega a confirmación cuando formulario es válido", async () => {
      render(<Donar />);
      fireEvent.click(screen.getByTestId('monto-btn-10000'));

      // Llenar formulario correctamente
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'María González' }
      });
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'maria@ejemplo.com' }
      });
      fireEvent.change(screen.getByTestId('input-telefono'), {
        target: { value: '9 8765 4321' }
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('pantalla-confirmacion')).toBeInTheDocument();
        expect(screen.getByTestId('confirmar-nombre')).toHaveTextContent('María González');
        expect(screen.getByTestId('confirmar-correo')).toHaveTextContent('maria@ejemplo.com');
        expect(screen.getByTestId('confirmar-monto')).toHaveTextContent('$10.000');
      });
    });

    it("11. Muestra datos de homenaje en confirmación cuando está activo", async () => {
      render(<Donar />);
      fireEvent.click(screen.getByTestId('monto-btn-20000'));

      // Llenar formulario con homenaje
      fireEvent.change(screen.getByTestId('input-nombre'), {
        target: { value: 'Carlos López' }
      });
      fireEvent.change(screen.getByTestId('input-correo'), {
        target: { value: 'carlos@ejemplo.com' }
      });

      // Activar y llenar homenaje
      fireEvent.click(screen.getByTestId('checkbox-homenaje'));
      fireEvent.change(screen.getByTestId('select-tipo-homenaje'), {
        target: { value: 'Recordando a...' }
      });
      fireEvent.change(screen.getByTestId('input-detalle-homenaje'), {
        target: { value: 'En memoria de mi abuelo' }
      });

      fireEvent.click(screen.getByTestId('btn-continuar'));

      await waitFor(() => {
        expect(screen.getByTestId('pantalla-confirmacion')).toBeInTheDocument();
        expect(screen.getByTestId('confirmar-tipo-homenaje')).toHaveTextContent('Recordando a...');
      });
    });
  });

  // =========================================================================
  // TESTS DE DONACIÓN EXITOSA
  // =========================================================================
  describe("Donación exitosa", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      mockProcesarDonacionUniversal.mockResolvedValue('donacion-exitosa-123');
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    // =========================================================================
    // TESTS DE USUARIO LOGUEADO
    // =========================================================================
    describe("Comportamiento con usuario logueado", () => {
      beforeEach(() => {
        mockIsLoggedIn = true;
        mockAuthData = {
          idUsuario: 1,
          nombre: 'Usuario Test',
          correo: 'usuario@test.com',
          telefono: '912345678'
        };
      });

      it("13. Precarga datos del perfil cuando usuario está logueado", async () => {
        render(<Donar />);
        fireEvent.click(screen.getByTestId('monto-btn-5000'));

        expect(screen.getByTestId('input-nombre')).toHaveValue('Usuario Test');
        expect(screen.getByTestId('input-correo')).toHaveValue('usuario@test.com');
      });

      // =========================================================================
      // TESTS DE MONTOS PERSONALIZADOS
      // =========================================================================
      describe("Montos personalizados", () => {
        it("14. Permite ingresar monto personalizado válido", () => {
          mockPrompt.mockReturnValue('25000');

          render(<Donar />);
          fireEvent.click(screen.getByTestId('monto-btn-otro'));

          expect(mockPrompt).toHaveBeenCalledWith('Por favor, ingresa el monto que deseas donar:', '25000');
          expect(screen.getByTestId('pantalla-formulario')).toBeInTheDocument();
          expect(screen.getByTestId('monto-seleccionado')).toHaveTextContent('$25.000');
        });

        it("18. Muestra alerta cuando monto personalizado es inválido", () => {
          mockPrompt.mockReturnValue('no-es-un-numero');

          render(<Donar />);
          fireEvent.click(screen.getByTestId('monto-btn-otro'));

          expect(mockAlert).toHaveBeenCalledWith('Por favor, ingresa un número válido y mayor a cero.');
        });
      });
    });
  })
})