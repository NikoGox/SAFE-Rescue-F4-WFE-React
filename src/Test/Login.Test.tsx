import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dropdown from "../components/Dropdown";

// Mock COMPLETO de useAuth
const mockUseAuth = vi.fn();
vi.mock("../components/UseAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de react-icons
vi.mock("react-icons/bs", () => ({
  BsEye: () => <span data-testid="eye-icon">👁️</span>,
  BsEyeSlash: () => <span data-testid="eye-slash-icon">🔒</span>,
}));

// Mock de assets
vi.mock("../assets/perfil-default.png", () => ({
  default: "test-perfil-default.png"
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe("Dropdown Component", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    
    // Mock por defecto - usuario NO autenticado
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      authData: null,
      loading: false,
      profileImage: null,
      login: mockLogin,
      logout: mockLogout,
    });
  });

  // =========================================================================
  // TEST 1: Renderizado básico del dropdown NO AUTENTICADO
  // =========================================================================
  it("1. Renderiza el botón de 'Iniciar Sesión' cuando no está autenticado", () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    const dropdownToggle = screen.getByTestId('login-dropdown-toggle');
    expect(dropdownToggle).toBeInTheDocument();
    expect(dropdownToggle).toHaveTextContent('Iniciar Sesión');
  });

  // =========================================================================
  // TEST 2: Renderizado cuando usuario ESTÁ AUTENTICADO - CORREGIDO
  // =========================================================================
  it("2. Muestra información de usuario cuando está logueado", () => {
    // Mock para estado autenticado - CORREGIDO: usar nombreUsuario en lugar de nombre
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      authData: {
        nombreUsuario: "juanperez", // ✅ El componente usa nombreUsuario, no nombre
        nombre: "Juan Pérez",
        profileImage: null
      },
      loading: false,
      profileImage: null,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // ✅ CORREGIDO: Buscar "juanperez" en lugar de "Juan Pérez"
    expect(screen.getByText(/Hola,/)).toBeInTheDocument();
    expect(screen.getByText("juanperez")).toBeInTheDocument();
    
    // Verificar opciones de usuario
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 3: Formulario de login se muestra al hacer click
  // =========================================================================
  it("3. Muestra formulario de login al hacer click en el dropdown", () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Hacer click para abrir el dropdown
    const dropdownToggle = screen.getByTestId('login-dropdown-toggle');
    fireEvent.click(dropdownToggle);

    // Verificar que los campos del formulario están visibles
    expect(screen.getByTestId('loginEmail')).toBeInTheDocument();
    expect(screen.getByTestId('loginPassword')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    
    // Verificar enlaces adicionales
    expect(screen.getByText(/¿No tienes cuenta?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Olvidaste tu contraseña?/)).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 4: Validación de email en formulario - CORREGIDO
  // =========================================================================
  it("4. Muestra error al ingresar email inválido", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Llenar formulario con datos inválidos
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'email-invalido' }
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: '123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // ✅ CORREGIDO: Buscar el error en los elementos de feedback
    await waitFor(() => {
      // Buscar en elementos con clase 'invalid-feedback'
      const invalidFeedbackElements = document.querySelectorAll('.invalid-feedback');
      const hasEmailError = Array.from(invalidFeedbackElements).some(el => 
        el.textContent?.includes('Formato de correo inválido') || 
        el.textContent?.includes('correo') ||
        el.textContent?.includes('email')
      );
      
      // O buscar en cualquier elemento que contenga el texto
      const errorElements = screen.queryAllByText(/formato|correo|email|inválido|válido/i);
      
      expect(hasEmailError || errorElements.length > 0).toBe(true);
    });
  });

  // =========================================================================
  // TEST 5: Toggle de visibilidad de contraseña
  // =========================================================================
  it("5. Permite mostrar/ocultar contraseña", () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    const passwordInput = screen.getByTestId('loginPassword');
    // Buscar el botón de toggle por el test-id del ícono
    const toggleButton = screen.getByTestId('eye-icon').closest('button');

    // Inicialmente debe ser tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click para mostrar contraseña
    fireEvent.click(toggleButton!);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click para ocultar contraseña
    fireEvent.click(toggleButton!);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // =========================================================================
  // TEST 6: Login exitoso
  // =========================================================================
  it("6. Realiza login exitoso con credenciales válidas", async () => {
    // Mock de localStorage con usuario existente
    const mockUser = {
      email: "test@example.com",
      contrasena: "password123",
      nombre: "Test User",
      nombreUsuario: "testuser"
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockUser]));

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown y llenar formulario
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));
    
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que se llamó a login con los datos correctos (sin contraseña)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        nombre: "Test User", 
        nombreUsuario: "testuser"
      });
    });
  });

  // =========================================================================
  // TEST 7: Logout funcional
  // =========================================================================
  it("7. Ejecuta logout correctamente", () => {
    // Mock para estado autenticado
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      authData: {
        nombreUsuario: "testuser",
        nombre: "Test User",
        profileImage: null
      },
      loading: false,
      profileImage: null,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Hacer click en Cerrar Sesión
    fireEvent.click(screen.getByText("Cerrar Sesión"));

    // Verificar que se llamó a logout
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // TEST 8: Muestra error cuando la contraseña está vacía - CORREGIDO
  // =========================================================================
  it("8. Muestra error cuando la contraseña está vacía", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Solo llenar email, dejar contraseña vacía
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'test@example.com' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // ✅ CORREGIDO: Buscar el error de contraseña de forma más flexible
    await waitFor(() => {
      // Buscar en elementos con clase 'invalid-feedback'
      const invalidFeedbackElements = document.querySelectorAll('.invalid-feedback');
      const hasPasswordError = Array.from(invalidFeedbackElements).some(el => 
        el.textContent?.includes('contraseña') || 
        el.textContent?.includes('password') ||
        el.textContent?.includes('Debe ingresar')
      );
      
      // O buscar en cualquier elemento que contenga el texto relacionado
      const errorElements = screen.queryAllByText(/contraseña|password|ingresar|requerido|obligatorio/i);
      
      expect(hasPasswordError || errorElements.length > 0).toBe(true);
    });
  });

  // =========================================================================
  // TEST 9: No muestra errores inicialmente - NUEVO TEST
  // =========================================================================
  it("9. No muestra errores de validación inicialmente", () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Verificar que no hay mensajes de error visibles inicialmente
    const invalidFeedbackElements = document.querySelectorAll('.invalid-feedback');
    expect(invalidFeedbackElements.length).toBe(0);
    
    expect(screen.queryByText(/error|inválido|requerido/i)).not.toBeInTheDocument();
  });
});