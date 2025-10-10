import React from "react";
import { Routes, Route } from "react-router-dom";

// Componentes de Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas (que van dentro de Routes)
import Home from "./pages/Home";
import Donaciones from "./pages/Donaciones";
import Contactanos from "./pages/Contactanos";
import Incidentes from "./pages/Incidentes";
import Perfil from "./pages/Perfil";


function App() {
  return (
    <div className="app-container">

      {/* 🧭 NAVBAR (Se renderiza siempre, fuera de Routes) */}
      <div className="contenedor-principal">
        <Navbar isLoggedIn={false} userName="Invitado" />
      </div>

      {/* 🧩 CONTENIDO PRINCIPAL (Donde cambian las páginas) */}
      <div className="main-content-wrapper mt-5"> {/* Usar una clase más descriptiva */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/contactanos" element={<Contactanos />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/perfil" element={<Perfil />} />
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