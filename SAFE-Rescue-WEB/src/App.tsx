import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";

function App() {
  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top w-100 shadow">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            AdoptaPet
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/"> Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/nosotros">
                  Nosotros
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contacto">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
            <div className="logo-brand">
                <img src="..\assets\sr_logo.png" alt="Logo" width="50" height="50"
                    className="d-inline-block align-text-top " id="logo">
                <a className="navbar-brand titulo" href="../home/index.html">SAFE Rescue</a>
            </div>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">

                <div className="navbar-nav ms-auto ">
                    <Link className="text-a-navbar nav-link color-11" to="/">Inicio</Link>
                    <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span>
                    <Link className="text-a-navbar nav-link color-11" to="/incidentes">Incidentes</Link>
                    <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span>
                    <Link className="text-a-navbar nav-link color-11" to="/contactanos">Contactanos</Link>
                    <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span>
                    <Link className="text-a-navbar nav-link color-11" to="/donaciones">Donar</Link>

                    <li className="nav-item dropdown">
                        <a className="nav-link" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <button id="btnIniciarSesion" className="boton-iniciar-sesion text-p-XS color-blanco">Iniciar
                                Sesión</button>

                            <button id="btnUsuario" className="boton-usuario text-p-XS color-negro">
                                <span id="lblNombre_usu_nav"></span>
                                <div className="imagen-box-nav">
                                    <img id="imgPerfilNav" src="../assets/perfil-default.png" alt="Perfil de usuario">
                                </div>
                            </button>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <div id="loginDropdownContent">
                                <form className="px-4 py-3" id="loginForm">
                                    <div class="mb-3">
                                        <label for="loginEmail" class="form-label">Correo</label>
                                        <input type="email" class="form-control" id="loginEmail"
                                            placeholder="email@example.com">
                                    </div>
                                    <div class="mb-3">
                                        <label for="loginPassword" class="form-label">Contraseña</label>
                                        <input type="password" className="form-control" id="loginPassword"
                                            placeholder="Password">
                                    </div>
                                    <p id="loginErrorMessage" style="display: none;"></p>

                                    <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
                                </form>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="../registrarse/registrarse.html">¿No tienes cuenta?
                                    Regístrate</a>
                                <a class="dropdown-item" href="#" id="forgotPassword">¿Olvidaste tu contraseña?</a>
                            </div>

                            <div id="userMenuOptions" style="display: none;">
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="../perfil/perfil.html">Mi Perfil</a>
                                <a class="dropdown-item" href="#" id="logoutButton">Cerrar Sesión</a>
                            </div>
                        </div>
                    </li>
                </div>

            </div>
        </div>
    </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </div>

      {/* FOOTER */}
      <footer className="footer text-center py-3 bg-primary text-white">
        © 2025 AdoptaPet - Todos los derechos reservados
      </footer>
    </div>
  );
}

export default App;