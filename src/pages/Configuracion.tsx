// src/pages/Configuracion.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Configuracion.css";

interface UserSettings {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        profileVisibility: 'public' | 'private' | 'contacts';
        showEmail: boolean;
        showPhone: boolean;
    };
    preferences: {
        language: string;
        theme: 'light' | 'dark' | 'auto';
        timezone: string;
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
    };
}

const Configuracion: React.FC = () => {
    const [settings, setSettings] = useState<UserSettings>({
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false
        },
        preferences: {
            language: 'es',
            theme: 'light',
            timezone: 'America/Santiago'
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30
        }
    });

    const [activeTab, setActiveTab] = useState('notificaciones');
    const [saved, setSaved] = useState(false);

    // Cargar configuraciones al montar el componente
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Error al cargar configuraciones:', error);
        }
    };

    const saveSettings = () => {
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error al guardar configuraciones:', error);
        }
    };

    const handleNotificationChange = (key: keyof UserSettings['notifications']) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: any) => {
        setSettings(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [key]: value
            }
        }));
    };

    const handlePreferenceChange = (key: keyof UserSettings['preferences'], value: string) => {
        setSettings(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value
            }
        }));
    };

    const handleSecurityChange = (key: keyof UserSettings['security'], value: any) => {
        setSettings(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [key]: value
            }
        }));
    };

    const resetToDefaults = () => {
        if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
            const defaultSettings: UserSettings = {
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                },
                privacy: {
                    profileVisibility: 'private',
                    showEmail: false,
                    showPhone: false
                },
                preferences: {
                    language: 'es',
                    theme: 'light',
                    timezone: 'America/Santiago'
                },
                security: {
                    twoFactorAuth: false,
                    sessionTimeout: 30
                }
            };
            setSettings(defaultSettings);
            localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
        }
    };

    const exportData = () => {
        const data = {
            settings,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `configuracion-safe-rescue-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="cuerpo-configuracion">

            <div className="contenedor-configuracion">
                <div className="header-configuracion">
                    <h1 className="titulo-configuracion">Configuración</h1>
                    <p className="subtitulo-configuracion">
                        Personaliza tu experiencia en SAFE Rescue
                    </p>
                </div>

                <div className="layout-configuracion">
                    {/* Sidebar de navegación */}
                    <div className="sidebar-configuracion">
                        <nav className="nav-configuracion">
                            <button
                                className={`config-nav-item ${activeTab === 'notificaciones' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notificaciones')}
                            >
                                🔔 Notificaciones
                            </button>
                            <button
                                className={`config-nav-item ${activeTab === 'privacidad' ? 'active' : ''}`}
                                onClick={() => setActiveTab('privacidad')}
                            >
                                🔒 Privacidad
                            </button>
                            <button
                                className={`config-nav-item ${activeTab === 'preferencias' ? 'active' : ''}`}
                                onClick={() => setActiveTab('preferencias')}
                            >
                                ⚙️ Preferencias
                            </button>
                            <button
                                className={`config-nav-item ${activeTab === 'seguridad' ? 'active' : ''}`}
                                onClick={() => setActiveTab('seguridad')}
                            >
                                🛡️ Seguridad
                            </button>
                            <button
                                className={`config-nav-item ${activeTab === 'avanzado' ? 'active' : ''}`}
                                onClick={() => setActiveTab('avanzado')}
                            >
                                🔧 Avanzado
                            </button>
                        </nav>
                    </div>

                    {/* Contenido principal */}
                    <div className="contenido-configuracion">
                        {saved && (
                            <div className="alert alert-success">
                ✅ Configuraciones guardadas correctamente
                            </div>
                        )}

                        {/* Pestaña de Notificaciones */}
                        {activeTab === 'notificaciones' && (
                            <div className="seccion-configuracion">
                                <h2>Configuración de Notificaciones</h2>
                                <p className="descripcion-seccion">
                                    Controla cómo y cuándo recibir notificaciones sobre incidentes y actividades.
                                </p>

                                <div className="config-group">
                                    <h3>Tipos de Notificación</h3>
                                    
                                    <div className="config-item">
                                        <div className="config-info">
                                            <label className="config-label">Notificaciones por Email</label>
                                            <p className="config-description">
                                                Recibe alertas importantes por correo electrónico
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.email}
                                                onChange={() => handleNotificationChange('email')}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div className="config-item">
                                        <div className="config-info">
                                            <label className="config-label">Notificaciones Push</label>
                                            <p className="config-description">
                                                Alertas en tiempo real en tu dispositivo
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.push}
                                                onChange={() => handleNotificationChange('push')}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div className="config-item">
                                        <div className="config-info">
                                            <label className="config-label">Notificaciones SMS</label>
                                            <p className="config-description">
                                                Alertas críticas por mensaje de texto
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.sms}
                                                onChange={() => handleNotificationChange('sms')}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña de Privacidad */}
                        {activeTab === 'privacidad' && (
                            <div className="seccion-configuracion">
                                <h2>Configuración de Privacidad</h2>
                                <p className="descripcion-seccion">
                                    Controla quién puede ver tu información y actividad.
                                </p>

                                <div className="config-group">
                                    <h3>Visibilidad del Perfil</h3>
                                    
                                    <div className="config-item-radio">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="public"
                                                checked={settings.privacy.profileVisibility === 'public'}
                                                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                            />
                                            <span className="radio-custom"></span>
                                            <div className="radio-info">
                                                <strong>Público</strong>
                                                <p>Todos los usuarios pueden ver tu perfil</p>
                                            </div>
                                        </label>

                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="private"
                                                checked={settings.privacy.profileVisibility === 'private'}
                                                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                            />
                                            <span className="radio-custom"></span>
                                            <div className="radio-info">
                                                <strong>Privado</strong>
                                                <p>Solo tú puedes ver tu perfil</p>
                                            </div>
                                        </label>

                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="contacts"
                                                checked={settings.privacy.profileVisibility === 'contacts'}
                                                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                            />
                                            <span className="radio-custom"></span>
                                            <div className="radio-info">
                                                <strong>Contactos</strong>
                                                <p>Solo tus contactos pueden ver tu perfil</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="config-group">
                                        <h3>Información Personal</h3>
                                        
                                        <div className="config-item">
                                            <div className="config-info">
                                                <label className="config-label">Mostrar Email</label>
                                                <p className="config-description">
                                                    Permitir que otros usuarios vean tu correo electrónico
                                                </p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.privacy.showEmail}
                                                    onChange={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="config-item">
                                            <div className="config-info">
                                                <label className="config-label">Mostrar Teléfono</label>
                                                <p className="config-description">
                                                    Permitir que otros usuarios vean tu número de teléfono
                                                </p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.privacy.showPhone}
                                                    onChange={() => handlePrivacyChange('showPhone', !settings.privacy.showPhone)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña de Preferencias */}
                        {activeTab === 'preferencias' && (
                            <div className="seccion-configuracion">
                                <h2>Preferencias Generales</h2>
                                <p className="descripcion-seccion">
                                    Personaliza la apariencia y comportamiento de la aplicación.
                                </p>

                                <div className="config-group">
                                    <div className="config-item-select">
                                        <label className="config-label">Idioma</label>
                                        <select
                                            value={settings.preferences.language}
                                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                            className="config-select"
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                            <option value="pt">Português</option>
                                        </select>
                                    </div>

                                    <div className="config-item-select">
                                        <label className="config-label">Tema</label>
                                        <select
                                            value={settings.preferences.theme}
                                            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                            className="config-select"
                                        >
                                            <option value="light">Claro</option>
                                            <option value="dark">Oscuro</option>
                                            <option value="auto">Automático</option>
                                        </select>
                                    </div>

                                    <div className="config-item-select">
                                        <label className="config-label">Zona Horaria</label>
                                        <select
                                            value={settings.preferences.timezone}
                                            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                                            className="config-select"
                                        >
                                            <option value="America/Santiago">Chile Continental (UTC-4)</option>
                                            <option value="America/Punta_Arenas">Chile Magallanes (UTC-3)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña de Seguridad */}
                        {activeTab === 'seguridad' && (
                            <div className="seccion-configuracion">
                                <h2>Configuración de Seguridad</h2>
                                <p className="descripcion-seccion">
                                    Gestiona la seguridad de tu cuenta y sesiones.
                                </p>

                                <div className="config-group">
                                    <div className="config-item">
                                        <div className="config-info">
                                            <label className="config-label">Autenticación de Dos Factores</label>
                                            <p className="config-description">
                                                Añade una capa extra de seguridad a tu cuenta
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.security.twoFactorAuth}
                                                onChange={() => handleSecurityChange('twoFactorAuth', !settings.security.twoFactorAuth)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    <div className="config-item-select">
                                        <label className="config-label">Tiempo de Espera de Sesión</label>
                                        <select
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                                            className="config-select"
                                        >
                                            <option value={15}>15 minutos</option>
                                            <option value={30}>30 minutos</option>
                                            <option value={60}>1 hora</option>
                                            <option value={120}>2 horas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña Avanzado */}
                        {activeTab === 'avanzado' && (
                            <div className="seccion-configuracion">
                                <h2>Configuración Avanzada</h2>
                                <p className="descripcion-seccion">
                                    Opciones avanzadas para usuarios expertos.
                                </p>

                                <div className="config-group">
                                    <div className="config-actions">
                                        <button
                                            className="btn btn-secondary btn-action"
                                            onClick={exportData}
                                        >
                                            📥 Exportar Configuración
                                        </button>
                                        
                                        <button
                                            className="btn btn-warning btn-action"
                                            onClick={resetToDefaults}
                                        >
                                            🔄 Restablecer por Defecto
                                        </button>

                                        <button
                                            className="btn btn-danger btn-action"
                                            onClick={() => alert('Función en desarrollo')}
                                        >
                                            🗑️ Eliminar Cuenta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="acciones-configuracion">
                            <button
                                className="btn btn-primary btn-guardar"
                                onClick={saveSettings}
                            >
                                💾 Guardar Cambios
                            </button>
                            <Link to="/perfil" className="btn btn-secondary">
                                ← Volver al Perfil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracion;