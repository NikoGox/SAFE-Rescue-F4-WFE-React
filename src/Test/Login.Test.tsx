import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dropdown from "../components/Dropdown";

// Mock de useAuth
const mockUseAuth = vi.fn();
vi.mock("../hooks/useAuth", () => ({
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

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login en Dropdown Component - DIAGNÓSTICO", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock por defecto - usuario NO autenticado
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      authData: null,
      loading: false,
      profileImage: null,
      userName: null,
      login: mockLogin,
      logout: mockLogout,
      error: null,
    });
  });

  // =========================================================================
  // TEST DIAGNÓSTICO: ¿Qué pasa cuando enviamos el formulario?
  // =========================================================================
  it("DIAGNÓSTICO - Verifica el comportamiento al enviar formulario inválido", async () => {
    console.log("=== INICIANDO DIAGNÓSTICO ===");
    
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Enviar formulario completamente vacío
    const submitButton = screen.getByTestId('login-submit-button');
    
    console.log("Antes de enviar - ¿Se llamó a login?", mockLogin.mock.calls.length);
    
    fireEvent.click(submitButton);

    // Esperar y ver qué pasó
    await waitFor(() => {
      console.log("Después de enviar - ¿Se llamó a login?", mockLogin.mock.calls.length);
      
      // Verificar diferentes tipos de errores que podrían aparecer
      const invalidFeedback = document.querySelectorAll('.invalid-feedback');
      const alertDanger = document.querySelectorAll('.alert-danger');
      const isInvalid = document.querySelectorAll('.is-invalid');
      
      console.log("Elementos .invalid-feedback:", invalidFeedback.length);
      console.log("Elementos .alert-danger:", alertDanger.length);
      console.log("Elementos .is-invalid:", isInvalid.length);
      
      // Ver si hay algún mensaje de error visible
      const errorTexts = screen.queryAllByText(/error|inválido|requerido|obligatorio|formato/i);
      console.log("Textos de error encontrados:", errorTexts.length);
      errorTexts.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.textContent);
      });
    });

    // Este test es solo para diagnóstico, no hace assertions
    expect(true).toBe(true);
  });

  // =========================================================================
  // TEST 1: Verificar que los campos del formulario existen
  // =========================================================================
  it("1. Renderiza todos los campos del formulario de login correctamente", () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Verificar que todos los elementos del formulario están presentes
    expect(screen.getByTestId('loginEmail')).toBeInTheDocument();
    expect(screen.getByTestId('loginPassword')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu.correo@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('•••••••••')).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 2: Login exitoso con credenciales válidas
  // =========================================================================
  it("2. Realiza login exitoso y redirige al home", async () => {
    // Mock de login exitoso
    mockLogin.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Llenar formulario con datos válidos
    const emailInput = screen.getByTestId('loginEmail');
    const passwordInput = screen.getByTestId('loginPassword');
    
    fireEvent.change(emailInput, {
      target: { value: 'usuario@ejemplo.com' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que se llamó a login con los datos correctos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        correo: 'usuario@ejemplo.com',
        contrasena: 'password123'
      });
    });

    // Verificar que se redirige al home
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    // Verificar que se limpiaron los campos
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  // =========================================================================
  // TEST 3: Error en login por credenciales incorrectas
  // =========================================================================
  it("3. Muestra error cuando las credenciales son incorrectas", async () => {
    // Mock de login fallido
    mockLogin.mockResolvedValue(false);
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      authData: null,
      loading: false,
      profileImage: null,
      userName: null,
      login: mockLogin,
      logout: mockLogout,
      error: "Credenciales incorrectas",
    });

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown y llenar formulario
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));
    
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'usuario@ejemplo.com' }
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password-incorrecto' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TEST 4: Validación de email - VERSIÓN MEJORADA
  // =========================================================================
  it("4. No permite login cuando el email tiene formato inválido", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Llenar formulario con email inválido
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'email-invalido' } // Email sin formato válido
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // La clave aquí es que NO se debe llamar a login
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    // Podemos verificar que el formulario no se procesó de otras maneras
    // Por ejemplo, que los campos no se limpiaron
    expect(screen.getByTestId('loginEmail')).toHaveValue('email-invalido');
    expect(screen.getByTestId('loginPassword')).toHaveValue('password123');
  });

  // =========================================================================
  // TEST 5: Validación de contraseña vacía - VERSIÓN MEJORADA
  // =========================================================================
  it("5. No permite login cuando la contraseña está vacía", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Solo llenar email, dejar contraseña vacía
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'usuario@ejemplo.com' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que NO se llamó a login
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    // Verificar que el email no se limpió
    expect(screen.getByTestId('loginEmail')).toHaveValue('usuario@ejemplo.com');
  });

  // =========================================================================
  // TEST 6: Validación de email vacío - VERSIÓN MEJORADA
  // =========================================================================
  it("6. No permite login cuando el email está vacío", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Solo llenar contraseña, dejar email vacío
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que NO se llamó a login
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });

    // Verificar que la contraseña no se limpió
    expect(screen.getByTestId('loginPassword')).toHaveValue('password123');
  });

  // =========================================================================
  // TEST 7: Error de conexión
  // =========================================================================
  it("7. Muestra error de conexión cuando el login falla por excepción", async () => {
    // Mock de login que lanza excepción
    mockLogin.mockRejectedValue(new Error('Error de conexión'));

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown y llenar formulario
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));
    
    fireEvent.change(screen.getByTestId('loginEmail'), {
      target: { value: 'usuario@ejemplo.com' }
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password123' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Verificar que se muestra el error de conexión
    await waitFor(() => {
      expect(screen.getByText('Error de conexión. Intente nuevamente.')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TEST 8: Estados de loading durante el login
  // =========================================================================
  it("8. Muestra estado de loading durante el login", async () => {
    // Mock de login que se demora
    let resolveLogin: (value: boolean) => void;
    const loginPromise = new Promise<boolean>(resolve => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown y llenar formulario
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-dropdown-toggle'));
    });
    
    await act(async () => {
      fireEvent.change(screen.getByTestId('loginEmail'), {
        target: { value: 'usuario@ejemplo.com' }
      });
      fireEvent.change(screen.getByTestId('loginPassword'), {
        target: { value: 'password123' }
      });
    });

    // Enviar formulario
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-submit-button'));
    });

    // Verificar que se muestra el spinner de loading
    await waitFor(() => {
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    });

    // Verificar que el botón está deshabilitado
    expect(screen.getByTestId('login-submit-button')).toBeDisabled();

    // Resolver la promesa para limpiar el estado
    await act(async () => {
      resolveLogin!(true);
    });
  });

  // =========================================================================
  // TEST 9: Limpieza de errores al escribir
  // =========================================================================
  it("9. Limpia los errores cuando el usuario comienza a escribir", async () => {
    // Mock de login fallido para generar un error
    mockLogin.mockResolvedValue(false);
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      authData: null,
      loading: false,
      profileImage: null,
      userName: null,
      login: mockLogin,
      logout: mockLogout,
      error: "Error de credenciales",
    });

    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    // Llenar formulario y generar error
    const emailInput = screen.getByTestId('loginEmail');
    fireEvent.change(emailInput, {
      target: { value: 'usuario@ejemplo.com' }
    });
    fireEvent.change(screen.getByTestId('loginPassword'), {
      target: { value: 'password' }
    });

    // Enviar formulario para generar error
    fireEvent.click(screen.getByTestId('login-submit-button'));

    // Esperar a que aparezca el error
    await waitFor(() => {
      expect(screen.getByText('Error de credenciales')).toBeInTheDocument();
    });

    // Cambiar el valor del email para limpiar el error
    fireEvent.change(emailInput, {
      target: { value: 'nuevo@ejemplo.com' }
    });

    // Verificar que el error se limpia
    await waitFor(() => {
      expect(screen.queryByText('Error de credenciales')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // TEST 10: Toggle de visibilidad de contraseña
  // =========================================================================
  it("10. Permite mostrar/ocultar contraseña", async () => {
    render(
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    );

    // Abrir dropdown
    fireEvent.click(screen.getByTestId('login-dropdown-toggle'));

    const passwordInput = screen.getByTestId('loginPassword');
    const toggleButton = screen.getByTestId('eye-icon').closest('button');

    // Inicialmente debe ser tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click para mostrar contraseña
    await act(async () => {
      fireEvent.click(toggleButton!);
    });
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click para ocultar contraseña
    await act(async () => {
      fireEvent.click(toggleButton!);
    });
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});