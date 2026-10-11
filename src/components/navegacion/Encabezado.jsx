import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import logo from "../../assets/ranch.jpeg";
import { useAuth } from "../../context/AuthContext";
import ChatIA from "../ia/ChatIA";

const Encabezado = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { tienePermiso, logout, usuario } = useAuth();
  const [mostrarChatIA, setMostrarChatIA] = useState(false);

  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  const cerrarSesion = async () => {
    await logout();
    setMostrarMenu(false);
    navigate("/login");
  };

  const esLogin = location.pathname === "/login" || location.pathname === "/registro" || location.pathname === "/register";
  const esCatalogo = location.pathname === "/catalogo" && !usuario;

  let contenidoMenu;

  if (esLogin) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2 align-items-center">
        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          <i className="bi-images me-2"></i>
          Catálogo
        </Nav.Link>
        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          <i className="bi-person-fill-lock me-2"></i>
          Iniciar sesión
        </Nav.Link>
        <Nav.Link
          onClick={() => manejarNavegacion("/registro")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          <i className="bi-person-plus me-2"></i>
          Registrarse
        </Nav.Link>
      </Nav>
    );
  } else if (esCatalogo) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2 align-items-center">
        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          <i className="bi-images me-2"></i>
          <strong>Catálogo</strong>
        </Nav.Link>
        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          <i className="bi-box-arrow-in-right me-2"></i>
          Iniciar sesión
        </Nav.Link>
      </Nav>
    );
  } else {
    contenidoMenu = (
      <>
        <Nav className="ms-auto pe-2 align-items-center">
          {tienePermiso("ver_inicio") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-house-fill me-1"></i>
              <strong>Inicio</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_catalogo") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/catalogo")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-images me-1"></i>
              <strong>Catálogo</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_productos") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/productos")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-bag-heart-fill me-1"></i>
              <strong>Productos</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_inventario") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/inventario")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-boxes me-1"></i>
              <strong>Inventario</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_categorias") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/categorias")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-bookmark-fill me-1"></i>
              <strong>Categorías</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_marcas") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/marcas")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-tag-fill me-1"></i>
              <strong>Marcas</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_proveedores") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/proveedores")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-truck me-1"></i>
              <strong>Proveedores</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_ventas") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/ventas")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-receipt-cutoff me-1"></i>
              <strong>Ventas</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_compras") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/compras")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-cart-check-fill me-1"></i>
              <strong>Compras</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_perfiles") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/perfiles")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-people-fill me-1"></i>
              <strong>Perfiles</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_empleados") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/empleados")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-person-badge me-1"></i>
              <strong>Empleados</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_clientes") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/clientes")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-person-lines-fill me-1"></i>
              <strong>Clientes</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_permisos") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/permisos")}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-shield-lock-fill me-1"></i>
              <strong>Permisos</strong>
            </Nav.Link>
          )}

          <Nav.Link
            onClick={() => setMostrarChatIA(true)}
            className="text-white"
            title="Asistente IA"
          >
            <i className="bi bi-robot fs-5"></i>
          </Nav.Link>

          {!mostrarMenu && (
            <Nav.Link
              onClick={cerrarSesion}
              className="text-white ms-2"
              title="Cerrar sesión"
            >
              <i className="bi-box-arrow-right fs-5"></i>
            </Nav.Link>
          )}
        </Nav>

        {mostrarMenu && (
          <div className="mt-3 p-3 rounded bg-light text-dark">
            <p className="mb-2">
              <i className="bi-envelope-fill me-2 text-primary"></i>
              <strong>{usuario?.nombre || usuario?.email || "Usuario"}</strong>
              {usuario?.rol && <span className="badge bg-secondary ms-2">{usuario.rol}</span>}
            </p>

            <button
              className="btn btn-outline-danger mt-3 w-100"
              onClick={cerrarSesion}
            >
              <i className="bi-box-arrow-right me-2"></i>
              Cerrar sesión
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <Navbar expand="lg" fixed="top" className="color-navbar shadow-lg" variant="dark">
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand
          onClick={() => manejarNavegacion(esCatalogo ? "/catalogo" : "/")}
          className="text-white fw-bold d-flex align-items-center"
          style={{ cursor: "pointer" }}
        >
          <img
            alt="DassyData Logo"
            src={logo}
            width="40"
            height="40"
            className="d-inline-block me-2 rounded-circle border border-white"
          />
          <div>
            <h4 className="mb-0 fw-bold" style={{ letterSpacing: "0.5px" }}>
              Dassy<span style={{ color: "#7cd5ff" }}>Data</span>
            </h4>
            <small style={{ fontSize: "10px", opacity: 0.85, display: "block" }}>
              FARMACIA DASSY
            </small>
          </div>
        </Navbar.Brand>

        {!esLogin && (
          <Navbar.Toggle aria-controls="menu-offcanvas" onClick={manejarToggle} />
        )}

        <Navbar.Offcanvas
          id="menu-offcanvas"
          placement="end"
          show={mostrarMenu}
          onHide={() => setMostrarMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <strong>Menú DassyData</strong>
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>{contenidoMenu}</Offcanvas.Body>
        </Navbar.Offcanvas>

        <ChatIA mostrar={mostrarChatIA} onCerrar={() => setMostrarChatIA(false)} />
      </Container>
    </Navbar>
  );
};

export default Encabezado;