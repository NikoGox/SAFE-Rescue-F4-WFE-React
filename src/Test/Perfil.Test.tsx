import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Perfil from "../pages/Perfil"; 

// Mocks globales
let mockIsLoggedIn = false;
let mockAuthData: any = null;
let mockLoading = false;

// Mock de useAuth
vi.mock('../components/UseAuth', () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
    authData: mockAuthData,
    loading: mockLoading,
    userName: mockAuthData?.nombre || '',
    profileImage: mockAuthData?.profileImage || null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuthStatus: vi.fn(),
  }),
}));

// Mock de FormField
vi.mock('../components/Formulario', () => ({
  default: (props: any) => (
    <div>
      <input 
        data-testid={props.dataTestId} 
        value={props.value || ''}
        disabled={props.disabled}
      />
      {props.error && <span data-testid={`error-${props.id}`}>{props.error}</span>}
    </div>
  )
}));

// Mock de SpecializedFields
vi.mock('../components/SpecializedFields', () => ({
  RutInputField: (props: any) => (
    <div>
      <input 
        data-testid={props.dataTestId} 
        value={props.value || ''}
        disabled={props.disabled}
      />
      {props.error && <span data-testid={`error-rut`}>{props.error}</span>}
    </div>
  ),
  PhoneInputField: (props: any) => (
    <div>
      <input 
        data-testid={props.dataTestId} 
        value={props.value || ''}
        disabled={props.disabled}
      />
      {props.error && <span data-testid={`error-telefono`}>{props.error}</span>}
    </div>
  )
}));

// Mock de ImageUploadModal
vi.mock('../components/ImageUploadModal', () => ({
  default: (props: any) => (
    props.isOpen ? <div data-testid="image-upload-modal">Modal de Imagen</div> : null
  )
}));

// Mock de validaciones (siempre retorna null para evitar validaciones complejas)
vi.mock('../utils/Validaciones', () => ({
  validateChileanRUT: () => null,
  validateEmail: () => null,
  validatePhoneNumber: () => null,
  validateNameLettersOnly: () => null,
  validateIsRequired: () => null,
}));

// Mock de imágenes
vi.mock("../assets/sr_logo.png", () => ({
  default: "test-logo.png"
}));

vi.mock("../assets/perfil-default.png", () => ({
  default: "test-perfil-default.png"
}));

// ✅ ELIMINADO: Mock de CSS - NO ES NECESARIO
// vi.mock("../pages/Perfil.module.css", () => ({ ... }));

describe("Componente Perfil", () => {
  beforeEach(() => {
    mockIsLoggedIn = false;
    mockAuthData = null;
    mockLoading = false;
    vi.clearAllMocks();
    localStorage.clear();
  });

  // =========================================================================
  // TEST 1: Carga de datos básica
  // =========================================================================
  it("1. Renderiza datos del usuario cuando está logueado", () => {
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: "Ana María",
      email: "ana.maria@ejemplo.com",
      telefono: "987654321",
      direccion: "Avenida Principal 456",
      rut: "22.222.222-2",
      nombreUsuario: "anamaria123",
    };

    render(<Perfil />);

    // Verificar que los campos existen
    expect(screen.getByTestId('perfil-nombre')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-email')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-rut')).toBeInTheDocument();
    
    // Verificar que está en modo visualización (campos deshabilitados)
    expect(screen.getByTestId('perfil-nombre')).toBeDisabled();
    expect(screen.getByTestId('perfil-email')).toBeDisabled();
    
    // Verificar botón de edición
    expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 2: Modos de visualización vs edición
  // =========================================================================
  it("2. Muestra estructura correcta en modo visualización", () => {
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: "Usuario Test",
      email: "test@test.com"
    };

    render(<Perfil />);

    // En modo visualización:
    expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
    expect(screen.queryByTestId('perfil-save-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('perfil-cancel-button')).not.toBeInTheDocument();
    
    expect(screen.getByTestId('perfil-nombre')).toBeDisabled();
    expect(screen.getByTestId('perfil-email')).toBeDisabled();
  });

  // =========================================================================
  // TEST 3: Estructura de imagen de perfil
  // =========================================================================
  it("3. Renderiza correctamente la imagen de perfil", () => {
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: "Usuario Test",
      profileImage: "custom-image.png"
    };

    render(<Perfil />);

    const profileImage = screen.getByTestId("profile-image");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute("src", "custom-image.png");
    
    const editImageButton = screen.getByTestId("edit-image-button");
    expect(editImageButton).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 4: Campos específicos y sus propiedades
  // =========================================================================
  it("4. Campos tienen las propiedades correctas", () => {
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: "Usuario Test",
      email: "test@test.com",
      telefono: "912345678",
      direccion: "Calle Test 123",
      rut: "12.345.678-9",
      nombreUsuario: "test_user"
    };

    render(<Perfil />);

    // Verificar que todos los campos existen
    expect(screen.getByTestId('perfil-nombreUsuario')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-nombre')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-rut')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-email')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-direccion')).toBeInTheDocument();
    expect(screen.getByTestId('perfil-telefono')).toBeInTheDocument();
    
    // Verificar que email siempre está deshabilitado
    expect(screen.getByTestId('perfil-email')).toBeDisabled();
  });

  // =========================================================================
  // TEST 5: Textos y títulos estáticos
  // =========================================================================
  it("5. Muestra los textos y títulos correctos", () => {
    mockIsLoggedIn = true;
    mockAuthData = { nombre: "Test" };

    render(<Perfil />);

    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Cuéntanos sobre ti.")).toBeInTheDocument();
    expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 6: No muestra errores inicialmente
  // =========================================================================
  it("6. No muestra errores de validación inicialmente", () => {
    mockIsLoggedIn = true;
    mockAuthData = {
      nombre: "Usuario Test",
      email: "test@test.com"
    };

    render(<Perfil />);

    expect(screen.queryByTestId("error-nombre")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-rut")).not.toBeInTheDocument();
  });

  // =========================================================================
  // TEST 7: Estado de carga
  // =========================================================================
  it("7. Muestra estado de carga cuando está cargando", () => {
    mockLoading = true;

    render(<Perfil />);

    expect(screen.getByText(/Cargando datos de sesión/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});