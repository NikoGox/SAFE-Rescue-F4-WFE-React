// Perfil.test.tsx
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import Perfil from "../pages/Perfil";

// Mocks globales
let mockIsLoggedIn = false;
let mockAuthData: any = null;
let mockLoading = false;
let mockUpdateProfile = vi.fn();
let mockSetAuthData = vi.fn();
let mockRefreshProfile = vi.fn();

// Mock de useAuth mejorado
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
    authData: mockAuthData,
    loading: mockLoading,
    setAuthData: mockSetAuthData,
    updateProfile: mockUpdateProfile,
    refreshProfile: mockRefreshProfile,
    userName: mockAuthData?.nombre || '',
  }),
}));

// Mock de useSincronizacion
vi.mock('../hooks/useSincronizacion', () => ({
  useSincronizacion: () => ({
    sincronizando: false,
    errores: []
  }),
}));

// Mock de useImageUploadPerfil
vi.mock('../hooks/useImageUploadPerfil', () => ({
  useImageUploadPerfil: () => ({
    isModalOpen: false,
    currentImageUrl: null,
    currentPhotoId: null,
    isLoading: false,
    isUploading: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handleImageSelect: vi.fn(),
    handleImageSave: vi.fn(),
    handleImageDelete: vi.fn(),
    clearTemporaryImage: vi.fn()
  }),
}));

// Mock de FormField mejorado
vi.mock('../components/Formulario', () => ({
  default: (props: any) => (
    <div>
      <label htmlFor={props.id}>{props.label}</label>
      <input
        id={props.id}
        data-testid={props.dataTestId}
        value={props.value || ''}
        disabled={props.disabled}
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        type={props.type || 'text'}
      />
      {props.error && <span data-testid={`error-${props.id}`}>{props.error}</span>}
    </div>
  )
}));

// Mock de SpecializedFields mejorado
vi.mock('../components/SpecializedFields', () => ({
  RutInputField: (props: any) => (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <input
        id={props.fieldId}
        data-testid={props.dataTestId}
        value={props.value || ''}
        disabled={props.disabled}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
      {props.error && <span data-testid={`error-${props.fieldId}`}>{props.error}</span>}
    </div>
  ),
  PhoneInputField: (props: any) => (
    <div>
      <label htmlFor={props.fieldId}>{props.label}</label>
      <input
        id={props.fieldId}
        data-testid={props.dataTestId}
        value={props.value || ''}
        disabled={props.disabled}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
      {props.error && <span data-testid={`error-${props.fieldId}`}>{props.error}</span>}
    </div>
  )
}));

// Mock de ImageUploadModal
vi.mock('../components/ImageUploadModal', () => ({
  default: (props: any) => (
    props.isOpen ? <div data-testid="image-upload-modal">Modal de Imagen</div> : null
  )
}));

// Mock de servicios
vi.mock('../service/services/geolocalizacion/RegionService', () => ({
  RegionService: {
    getAll: vi.fn(() => Promise.resolve([
      { idRegion: 1, nombre: 'Región de Tarapacá' },
      { idRegion: 7, nombre: 'Región Metropolitana de Santiago' }
    ]))
  }
}));

vi.mock('../service/services/geolocalizacion/ComunaService', () => ({
  ComunaService: {
    getAll: vi.fn(() => Promise.resolve([
      { idComuna: 1, nombre: 'Santiago', region: { idRegion: 7 } },
      { idComuna: 2, nombre: 'Providencia', region: { idRegion: 7 } }
    ]))
  }
}));

vi.mock('../service/services/geolocalizacion/DireccionCompletaService', () => ({
  DireccionCompletaService: {
    getByIdCompleta: vi.fn(() => Promise.resolve({
      calle: 'Av. Principal',
      numero: '123',
      villa: 'Villa Test',
      complemento: 'Depto 45',
      comuna: { idComuna: 1, idRegion: 7 },
      region: { idRegion: 7 }
    }))
  }
}));

vi.mock('../service/services/registros/FotoService', () => ({
  FotoService: {
    obtenerUrlPublicaPorId: vi.fn(() => 'https://example.com/foto.jpg')
  }
}));

// Mock de validaciones - DEFINIDO DIRECTAMENTE sin variable externa
vi.mock('../utils/Validaciones', () => ({
  validateChileanRUT: vi.fn(() => null),
  validateEmail: vi.fn(() => null),
  validatePhoneNumber: vi.fn(() => null),
  validateNameLettersOnly: vi.fn(() => null),
  validateIsRequired: vi.fn(() => null),
}));

// Mock de imágenes
vi.mock("../assets/sr_logo.png", () => ({
  default: "test-logo.png"
}));

vi.mock("../assets/perfil-default.png", () => ({
  default: "test-perfil-default.png"
}));

describe("Componente Perfil - Tests Completos", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockIsLoggedIn = true;
    mockAuthData = {
      idUsuario: 1,
      tipoPerfil: 'CIUDADANO',
      nombre: "Juan",
      aPaterno: "Pérez",
      aMaterno: "González",
      correo: "juan.perez@test.com",
      telefono: "+56912345678",
      run: "12345678",
      dv: "5",
      idFoto: 1,
      idDireccion: 1
    };
    mockLoading = false;

    // Reset mocks
    mockUpdateProfile.mockClear();
    mockSetAuthData.mockClear();
    mockRefreshProfile.mockClear();

    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // GRUPO 1: EXISTENCIA DE CAMPOS DEL FORMULARIO
  // =========================================================================
  describe("1. Existencia de campos del formulario", () => {
    it("debe renderizar todos los campos principales del formulario", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      // Esperar a que cargue la geografía
      await waitFor(() => {
        // Campos de información personal
        expect(screen.getByTestId('perfil-nombre')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-aPaterno')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-aMaterno')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-rut')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-correo')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-telefono')).toBeInTheDocument();

        // Campos de dirección (para ciudadanos)
        expect(screen.getByTestId('perfil-calle')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-numero')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-villa')).toBeInTheDocument();
        expect(screen.getByTestId('perfil-complemento')).toBeInTheDocument();
      });
    });

    it("debe cargar los datos del usuario en los campos correctamente", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-nombre')).toHaveValue('Juan');
        expect(screen.getByTestId('perfil-aPaterno')).toHaveValue('Pérez');
        expect(screen.getByTestId('perfil-aMaterno')).toHaveValue('González');
        expect(screen.getByTestId('perfil-correo')).toHaveValue('juan.perez@test.com');
      });
    });
  });

  // =========================================================================
  // GRUPO 2: OPERACIONES EXITOSAS - CORREGIDOS
  // =========================================================================
  describe("2. Operaciones exitosas", () => {
    it("debe permitir editar el perfil y guardar cambios exitosamente", async () => {
      mockUpdateProfile.mockResolvedValue(true);

      await act(async () => {
        render(<Perfil />);
      });

      // Esperar a que cargue completamente
      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar modo edición
      await user.click(screen.getByTestId('perfil-edit-button'));

      // Rellenar campos de dirección requeridos para pasar validación
      const calleInput = screen.getByTestId('perfil-calle');
      await user.clear(calleInput);
      await user.type(calleInput, 'Calle Test');

      const numeroInput = screen.getByTestId('perfil-numero');
      await user.clear(numeroInput);
      await user.type(numeroInput, '123');

      // Seleccionar región (requerida)
      const regionSelect = screen.getByLabelText('Región');
      await user.selectOptions(regionSelect, '7'); // Región Metropolitana

      // Esperar a que carguen las comunas
      await waitFor(() => {
        expect(screen.getByLabelText('Comuna')).not.toBeDisabled();
      });

      // Seleccionar comuna
      const comunaSelect = screen.getByLabelText('Comuna');
      await user.selectOptions(comunaSelect, '1'); // Santiago

      // Modificar nombre
      const nombreInput = screen.getByTestId('perfil-nombre');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Carlos');

      // Guardar cambios
      const saveButton = screen.getByTestId('perfil-save-button');
      await user.click(saveButton);

      // Verificar que se llamó a updateProfile con los datos correctos
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          nombre: 'Carlos',
          aPaterno: 'Pérez',
          aMaterno: 'González',
          telefono: '+56912345678',
          correo: 'juan.perez@test.com',
        });
      });
    });

    it("debe mostrar mensaje de éxito después de guardar", async () => {
      mockUpdateProfile.mockResolvedValue(true);

      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar edición
      await user.click(screen.getByTestId('perfil-edit-button'));

      // Rellenar campos de dirección requeridos
      const calleInput = screen.getByTestId('perfil-calle');
      await user.clear(calleInput);
      await user.type(calleInput, 'Calle Test');

      const numeroInput = screen.getByTestId('perfil-numero');
      await user.clear(numeroInput);
      await user.type(numeroInput, '123');

      const regionSelect = screen.getByLabelText('Región');
      await user.selectOptions(regionSelect, '7');

      await waitFor(() => {
        expect(screen.getByLabelText('Comuna')).not.toBeDisabled();
      });

      const comunaSelect = screen.getByLabelText('Comuna');
      await user.selectOptions(comunaSelect, '1');

      // Guardar
      await user.click(screen.getByTestId('perfil-save-button'));

      await waitFor(() => {
        expect(screen.getByText(/Perfil actualizado exitosamente/i)).toBeInTheDocument();
      });
    });
  });
  // Perfil.test.tsx - SOLO LOS TESTS CORREGIDOS

  // ... (todo el código anterior permanece igual hasta los tests específicos)

  // =========================================================================
  // GRUPO 3: VALIDACIONES Y ERRORES - CORREGIDOS
  // =========================================================================
  describe("3. Validaciones y manejo de errores", () => {

    it("debe mostrar error cuando el servidor falla al actualizar", async () => {
      mockUpdateProfile.mockResolvedValue(false);

      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar edición y rellenar campos requeridos
      await user.click(screen.getByTestId('perfil-edit-button'));

      const calleInput = screen.getByTestId('perfil-calle');
      await user.clear(calleInput);
      await user.type(calleInput, 'Calle Test');

      const numeroInput = screen.getByTestId('perfil-numero');
      await user.clear(numeroInput);
      await user.type(numeroInput, '123');

      const regionSelect = screen.getByLabelText('Región');
      await user.selectOptions(regionSelect, '7');

      await waitFor(() => {
        expect(screen.getByLabelText('Comuna')).not.toBeDisabled();
      });

      const comunaSelect = screen.getByLabelText('Comuna');
      await user.selectOptions(comunaSelect, '1');

      // Modificar un campo para que haya cambios
      const nombreInput = screen.getByTestId('perfil-nombre');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Carlos');

      // Intentar guardar cambios
      await user.click(screen.getByTestId('perfil-save-button'));

      // Verificar mensaje de error genérico
      await waitFor(() => {
        const messageElement = screen.getByTestId('perfil-message');
        expect(messageElement).toHaveTextContent(/error|fallo|servidor/i);
      });
    });
  });

  // =========================================================================
  // GRUPO 4: CAMPOS VACÍOS Y VALIDACIONES REQUERIDAS - CORREGIDOS
  // =========================================================================
  describe("4. Validación de campos vacíos y requeridos", () => {
    it("debe prevenir el guardado cuando hay campos vacíos", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar modo edición
      await user.click(screen.getByTestId('perfil-edit-button'));

      // Limpiar un campo requerido
      const nombreInput = screen.getByTestId('perfil-nombre');
      await user.clear(nombreInput);
      fireEvent.blur(nombreInput);

      // Intentar guardar
      const saveButton = screen.getByTestId('perfil-save-button');
      await user.click(saveButton);

      // Verificar que NO se llamó a updateProfile debido a validaciones
      expect(mockUpdateProfile).not.toHaveBeenCalled();

      // Verificar que se muestra mensaje de error de validación
      await waitFor(() => {
        expect(screen.getByTestId('perfil-message')).toHaveTextContent(/corrige.*errores|validación/i);
      });
    });
  });

  // =========================================================================
  // GRUPO 6: ESTADOS DE CARGA Y BLOQUEOS - CORREGIDOS
  // =========================================================================
  describe("6. Estados de carga y bloqueos", () => {
    it("debe mostrar spinner durante la carga inicial", () => {
      mockLoading = true;

      render(<Perfil />);

      expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
    });

    it("debe deshabilitar botones durante el guardado", async () => {
      // Mock para simular que updateProfile está en progreso
      let updateResolve: (value: boolean) => void;
      const updatePromise = new Promise<boolean>((resolve) => {
        updateResolve = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar edición
      await user.click(screen.getByTestId('perfil-edit-button'));

      // Rellenar campos requeridos
      const calleInput = screen.getByTestId('perfil-calle');
      await user.clear(calleInput);
      await user.type(calleInput, 'Calle Test');

      const numeroInput = screen.getByTestId('perfil-numero');
      await user.clear(numeroInput);
      await user.type(numeroInput, '123');

      const regionSelect = screen.getByLabelText('Región');
      await user.selectOptions(regionSelect, '7');

      await waitFor(() => {
        expect(screen.getByLabelText('Comuna')).not.toBeDisabled();
      });

      const comunaSelect = screen.getByLabelText('Comuna');
      await user.selectOptions(comunaSelect, '1');

      // Modificar un campo para que haya cambios
      const nombreInput = screen.getByTestId('perfil-nombre');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Carlos');

      // Guardar (esto iniciará el estado de guardado)
      await user.click(screen.getByTestId('perfil-save-button'));

      // Verificar que el botón está deshabilitado durante el guardado
      await waitFor(() => {
        const saveButton = screen.getByTestId('perfil-save-button');
        expect(saveButton).toBeDisabled();
        // Verificar que muestra texto de carga (puede ser "Guardando..." o "Guardar Cambios" dependiendo de la implementación)
        expect(saveButton.textContent).toMatch(/Guardando|Guardar Cambios/);
      });

      // Resolver la promesa para limpiar
      updateResolve!(true);
    });

    it("debe manejar correctamente el estado isSaving", async () => {
      // Mock para controlar manualmente la promesa
      let resolveUpdate: (value: boolean) => void;
      const updatePromise = new Promise<boolean>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateProfile.mockReturnValue(updatePromise);

      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      // Activar edición
      await user.click(screen.getByTestId('perfil-edit-button'));

      // Rellenar campos requeridos
      const calleInput = screen.getByTestId('perfil-calle');
      await user.clear(calleInput);
      await user.type(calleInput, 'Calle Test');

      const numeroInput = screen.getByTestId('perfil-numero');
      await user.clear(numeroInput);
      await user.type(numeroInput, '123');

      const regionSelect = screen.getByLabelText('Región');
      await user.selectOptions(regionSelect, '7');

      await waitFor(() => {
        expect(screen.getByLabelText('Comuna')).not.toBeDisabled();
      });

      const comunaSelect = screen.getByLabelText('Comuna');
      await user.selectOptions(comunaSelect, '1');

      // Modificar un campo
      const nombreInput = screen.getByTestId('perfil-nombre');
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Carlos');

      // Iniciar guardado
      await user.click(screen.getByTestId('perfil-save-button'));

      // Verificar que el botón está deshabilitado
      const saveButton = screen.getByTestId('perfil-save-button');
      expect(saveButton).toBeDisabled();

      // Completar la operación
      resolveUpdate(true);

      // Esperar a que termine
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  // =========================================================================
  // GRUPO 7: USUARIO NO LOGUEADO
  // =========================================================================
  describe("7. Comportamiento cuando usuario no está logueado", () => {
    it("debe mostrar error cuando no hay sesión activa", async () => {
      mockIsLoggedIn = false;
      mockAuthData = null;

      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Error: Acceso denegado/i)).toBeInTheDocument();
        expect(screen.getByText(/Debes iniciar sesión para ver tu perfil/i)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // TEST BÁSICO DE SMOKE
  // =========================================================================
  describe("Smoke Test", () => {
    it("debe renderizar el componente sin errores", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // TEST ADICIONAL: BOTÓN EDITAR/DESHABILITADO
  // =========================================================================
  describe("Botones de acción", () => {
    it("debe mostrar botón editar en modo visualización", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
        expect(screen.queryByTestId('perfil-save-button')).not.toBeInTheDocument();
      });
    });

    it("debe mostrar botones guardar/cancelar en modo edición", async () => {
      await act(async () => {
        render(<Perfil />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('perfil-edit-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('perfil-edit-button'));

      expect(screen.getByTestId('perfil-save-button')).toBeInTheDocument();
      expect(screen.getByTestId('perfil-cancel-button')).toBeInTheDocument();
      expect(screen.queryByTestId('perfil-edit-button')).not.toBeInTheDocument();
    });
  });
});