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
import Nosotros from "./pages/Nosotros";
import RecuperarContrasena from "./pages/RecuperarContrasena";

function App() {
  return (
    <div className="app-container">

      <div className="contenedor-principal">
        <Navbar />
      </div>

      <div className="main-content-wrapper mt-5"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/contactanos" element={<Contactanos />} />
          <Route path="/donar" element={<Donar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/registrarse" element={<Registrarse />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        </Routes>
      </div>

      <div className="main-content-wrapper">
        <Footer />
      </div>

    </div>
  );
}

export default App;