import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import EncabezadoDassy from "./components/navegacion/EncabezadoDassy";
import NavegacionInferior from "./components/navegacion/NavegacionInferior";
import RegresoEntidades from "./components/navegacion/RegresoEntidades";
import RutaProtegida from "./components/rutas/RutaProtegida";
import { useAuth } from "./context/AuthContext";

import Inicio from "./views/Inicio";
import Catalogo from "./views/Catalogo";
import Productos from "./views/Productos";
import Categorias from "./views/Categorias";
import Inventario from "./views/Inventario";
import Marcas from "./views/Marcas";
import Proveedores from "./views/Proveedores";
import Compras from "./views/Compras";
import Ventas from "./views/Ventas";
import DetalleVentas from "./views/DetalleVentas";
import DetalleCompras from "./views/DetalleCompras";
import Perfiles from "./views/Perfiles";
import Clientes from "./views/Clientes";
import Empleados from "./views/Empleados";
import Permisos from "./views/Permisos";
import Login from "./views/Login";
import Registro from "./views/Registro";
import Bienvenida from "./views/Bienvenida";
import Pagina404 from "./views/Pagina404";

import "./App.css";
import "./components/navegacion/Entidades.css";
import "./Glassmorphism.css";

function InicioPorRol() {
  const { usuario } = useAuth();
  if (usuario?.rol === "propietario") return <RutaProtegida><Inicio /></RutaProtegida>;
  return usuario ? <Catalogo /> : <Bienvenida />;
}

function RutaEntidadProtegida({ children }) {
  const { usuario } = useAuth();
  const location = useLocation();
  const mostrarRegreso = !(usuario?.rol === "cliente" && location.pathname === "/perfiles");

  return <RutaProtegida><div className="entity-workspace">{mostrarRegreso && <RegresoEntidades />}{children}</div></RutaProtegida>;
}

const App = () => {
  return (
    <Router>
      <EncabezadoDassy />

      <main className="margen-superior-main app-main">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/register" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Rutas Protegidas */}
          <Route path="/" element={<InicioPorRol />} />
          <Route path="/productos" element={<RutaEntidadProtegida><Productos /></RutaEntidadProtegida>} />
          <Route path="/categorias" element={<RutaEntidadProtegida><Categorias /></RutaEntidadProtegida>} />
          <Route path="/inventario" element={<RutaEntidadProtegida><Inventario /></RutaEntidadProtegida>} />
          <Route path="/marcas" element={<RutaEntidadProtegida><Marcas /></RutaEntidadProtegida>} />
          <Route path="/proveedores" element={<RutaEntidadProtegida><Proveedores /></RutaEntidadProtegida>} />
          <Route path="/compras" element={<RutaEntidadProtegida><Compras /></RutaEntidadProtegida>} />
          <Route path="/ventas" element={<RutaEntidadProtegida><Ventas /></RutaEntidadProtegida>} />
          <Route path="/detalle-ventas" element={<RutaProtegida><DetalleVentas /></RutaProtegida>} />
          <Route path="/detalle-compras" element={<RutaProtegida><DetalleCompras /></RutaProtegida>} />
          <Route path="/perfiles" element={<RutaEntidadProtegida><Perfiles /></RutaEntidadProtegida>} />
          <Route path="/clientes" element={<RutaEntidadProtegida><Clientes /></RutaEntidadProtegida>} />
          <Route path="/empleados" element={<RutaEntidadProtegida><Empleados /></RutaEntidadProtegida>} />
          <Route path="/permisos" element={<RutaEntidadProtegida><Permisos /></RutaEntidadProtegida>} />

          {/* Ruta 404 */}
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
      <NavegacionInferior />
    </Router>
  );
};

export default App;
