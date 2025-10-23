import React from "react";
import { Routes, Route } from "react-router-dom";

// Componentes de Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas (que van dentro de Routes)
import Home from "./pages/Home";
import Donar from "./pages/Donar";
import Contactanos from "./pages/Contactanos";
import Incidentes from "./pages/Incidentes";
import Perfil from "./pages/Perfil";
import Registrarse from "./pages/Registrarse";
import Configuracion from "./pages/Configuracion";
import Nosotros from "./pages/Nosotros";
import RecuperarContrasena from "./pages/RecuperarContrasena";

function App() {
  return (
    <div className="app-container">

      {/* 🧭 NAVBAR (Se renderiza siempre, fuera de Routes) */}
      <div className="contenedor-principal">
        <Navbar />
      </div>

      {/* 🧩 CONTENIDO PRINCIPAL (Donde cambian las páginas) */}
      <div className="main-content-wrapper mt-5"> {/* Usar una clase más descriptiva */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/contactanos" element={<Contactanos />} />
          <Route path="/donar" element={<Donar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/registrarse" element={<Registrarse />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        </Routes>
      </div>

      {/* 🦶 FOOTER (Se renderiza siempre, fuera de Routes) */}
      <div className="main-content-wrapper">
        <Footer />
      </div>

    </div>
  );
}

export default App;