import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaProveedores from "../components/proveedores/TablaProveedores";
import TarjetaProveedor from "../components/proveedores/TarjetaProveedor";
import ModalRegistroProveedor from "../components/proveedores/ModalRegistroProveedor";
import ModalEdicionProveedor from "../components/proveedores/ModalEdicionProveedor";
import ModalEliminacionProveedor from "../components/proveedores/ModalEliminacionProveedor";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState({ id: "", nombre: "", contacto: "", telefono: "", direccion: "" });
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: "", contacto: "", telefono: "", direccion: "" });

  // Notificaciones, búsqueda y paginación
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const cargarProveedores = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setProveedores(data || []);
      setProveedoresFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al cargar proveedores: ${err.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    const q = textoBusqueda.toLowerCase().trim();
    if (!q) {
      setProveedoresFiltrados(proveedores);
    } else {
      setProveedoresFiltrados(
        proveedores.filter(
          (p) =>
            p.nombre?.toLowerCase().includes(q) ||
            p.contacto?.toLowerCase().includes(q) ||
            p.telefono?.toLowerCase().includes(q)
        )
      );
    }
    establecerPaginaActual(1);
  }, [textoBusqueda, proveedores]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(indicePrimero, indiceUltimo);

  const manejoCambioInput = (e) => {
    setNuevoProveedor({ ...nuevoProveedor, [e.target.name]: e.target.value });
  };

  const manejoCambioInputEdicion = (e) => {
    setProveedorEditar({ ...proveedorEditar, [e.target.name]: e.target.value });
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();
    if (!nuevoProveedor.nombre.trim()) return;

    try {
      const { error } = await supabase.from("proveedores").insert([nuevoProveedor]);
      if (error) throw error;

      setMostrarModalRegistro(false);
      setNuevoProveedor({ nombre: "", contacto: "", telefono: "", direccion: "" });
      setToast({ mostrar: true, mensaje: "Proveedor registrado con éxito.", tipo: "exito" });
      cargarProveedores();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al registrar: ${err.message}`, tipo: "error" });
    }
  };

  const actualizarProveedor = async () => {
    if (!proveedorEditar.nombre.trim()) return;

    try {
      const { error } = await supabase
        .from("proveedores")
        .update({
          nombre: proveedorEditar.nombre.trim(),
          contacto: proveedorEditar.contacto,
          telefono: proveedorEditar.telefono,
          direccion: proveedorEditar.direccion
        })
        .eq("id", proveedorEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Proveedor actualizado correctamente.", tipo: "exito" });
      cargarProveedores();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
    }
  };

  const confirmarEliminacion = async () => {
    if (!proveedorAEliminar) return;

    try {
      const { error } = await supabase.from("proveedores").delete().eq("id", proveedorAEliminar.id);
      if (error) throw error;

      setMostrarModalEliminacion(false);
      setProveedorAEliminar(null);
      setToast({ mostrar: true, mensaje: "Proveedor eliminado con éxito.", tipo: "exito" });
      cargarProveedores();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al eliminar: ${err.message}`, tipo: "error" });
    }
  };

  const copiarProveedor = (p) => {
    navigator.clipboard.writeText(`Proveedor: ${p.nombre} | Contacto: ${p.contacto || 'N/A'} | Tel: ${p.telefono || 'N/A'}`);
    setToast({ mostrar: true, mensaje: "Datos copiados al portapapeles.", tipo: "exito" });
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6}>
          <h2 className="mb-1 text-primary">
            <Icono nombre="camion" size={21} className="me-2" />Gestión de Proveedores
          </h2>
          <p className="text-muted mb-0">Administra los proveedores y laboratorios de Farmacia Dassy</p>
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0 d-flex justify-content-md-end gap-2">
          <Button
            variant={vistaTabla ? "outline-primary" : "primary"}
            onClick={() => setVistaTabla(!vistaTabla)}
            title={vistaTabla ? "Ver como tarjetas" : "Ver como tabla"}
          >
            <Icono nombre={vistaTabla ? "cuadricula" : "tabla"} size={17} />
          </Button>
          <Button variant="success" onClick={() => setMostrarModalRegistro(true)}>
            <Icono nombre="mas" size={16} className="me-1" /> Nuevo Proveedor
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={8}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por nombre, contacto o teléfono..."
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0 text-muted">
          <span>Total proveedores: <strong>{proveedoresFiltrados.length}</strong></span>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando proveedores de Farmacia Dassy...</p>
        </div>
      ) : vistaTabla ? (
        <TablaProveedores
          proveedores={proveedoresPaginados}
          abrirModalEdicion={(p) => { setProveedorEditar(p); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(p) => { setProveedorAEliminar(p); setMostrarModalEliminacion(true); }}
          copiarProveedor={copiarProveedor}
        />
      ) : (
        <TarjetaProveedor
          proveedores={proveedoresPaginados}
          abrirModalEdicion={(p) => { setProveedorEditar(p); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(p) => { setProveedorAEliminar(p); setMostrarModalEliminacion(true); }}
          copiarProveedor={copiarProveedor}
        />
      )}

      {proveedoresFiltrados.length > registrosPorPagina && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Paginacion
              totalRegistros={proveedoresFiltrados.length}
              registrosPorPagina={registrosPorPagina}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modales */}
      <ModalRegistroProveedor
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevoProveedor={nuevoProveedor}
        manejoCambioInput={manejoCambioInput}
        guardarProveedor={guardarProveedor}
      />

      <ModalEdicionProveedor
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        proveedorEditar={proveedorEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarProveedor={actualizarProveedor}
      />

      <ModalEliminacionProveedor
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        proveedorAEliminar={proveedorAEliminar}
        confirmarEliminacion={confirmarEliminacion}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Proveedores;
