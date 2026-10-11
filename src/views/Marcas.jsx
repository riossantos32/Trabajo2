import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaMarcas from "../components/marcas/TablaMarcas";
import TarjetaMarca from "../components/marcas/TarjetaMarca";
import ModalRegistroMarca from "../components/marcas/ModalRegistroMarca";
import ModalEdicionMarca from "../components/marcas/ModalEdicionMarca";
import ModalEliminacionMarca from "../components/marcas/ModalEliminacionMarca";

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [marcaEditar, setMarcaEditar] = useState({ id: "", nombre: "" });
  const [marcaAEliminar, setMarcaAEliminar] = useState(null);
  const [nuevaMarca, setNuevaMarca] = useState({ nombre: "" });

  // Notificaciones, búsqueda y paginación
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const cargarMarcas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("marcas")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setMarcas(data || []);
      setMarcasFiltradas(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al cargar marcas: ${err.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  useEffect(() => {
    const q = textoBusqueda.toLowerCase().trim();
    if (!q) {
      setMarcasFiltradas(marcas);
    } else {
      setMarcasFiltradas(
        marcas.filter((m) => m.nombre?.toLowerCase().includes(q))
      );
    }
    establecerPaginaActual(1);
  }, [textoBusqueda, marcas]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const marcasPaginadas = marcasFiltradas.slice(indicePrimero, indiceUltimo);

  const manejoCambioInput = (e) => {
    setNuevaMarca({ ...nuevaMarca, [e.target.name]: e.target.value });
  };

  const manejoCambioInputEdicion = (e) => {
    setMarcaEditar({ ...marcaEditar, [e.target.name]: e.target.value });
  };

  const guardarMarca = async (e) => {
    e.preventDefault();
    if (!nuevaMarca.nombre.trim()) return;

    try {
      const { error } = await supabase.from("marcas").insert([{ nombre: nuevaMarca.nombre.trim() }]);
      if (error) throw error;

      setMostrarModalRegistro(false);
      setNuevaMarca({ nombre: "" });
      setToast({ mostrar: true, mensaje: "Marca registrada con éxito.", tipo: "exito" });
      cargarMarcas();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al registrar: ${err.message}`, tipo: "error" });
    }
  };

  const actualizarMarca = async () => {
    if (!marcaEditar.nombre.trim()) return;

    try {
      const { error } = await supabase
        .from("marcas")
        .update({ nombre: marcaEditar.nombre.trim() })
        .eq("id", marcaEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Marca actualizada correctamente.", tipo: "exito" });
      cargarMarcas();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
    }
  };

  const confirmarEliminacion = async () => {
    if (!marcaAEliminar) return;

    try {
      const { error } = await supabase.from("marcas").delete().eq("id", marcaAEliminar.id);
      if (error) throw error;

      setMostrarModalEliminacion(false);
      setMarcaAEliminar(null);
      setToast({ mostrar: true, mensaje: "Marca eliminada con éxito.", tipo: "exito" });
      cargarMarcas();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al eliminar: ${err.message}`, tipo: "error" });
    }
  };

  const copiarMarca = (marca) => {
    navigator.clipboard.writeText(`Marca: ${marca.nombre} (ID: ${marca.id})`);
    setToast({ mostrar: true, mensaje: "Datos copiados al portapapeles.", tipo: "exito" });
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6}>
          <h2 className="mb-1 text-primary">
            <Icono nombre="etiqueta" size={21} className="me-2" />Gestión de Marcas
          </h2>
          <p className="text-muted mb-0">Administra las marcas comerciales de Farmacia Dassy</p>
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
            <Icono nombre="mas" size={16} className="me-1" /> Nueva Marca
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={8}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar marca por nombre..."
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0 text-muted">
          <span>Total marcas: <strong>{marcasFiltradas.length}</strong></span>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando marcas de Farmacia Dassy...</p>
        </div>
      ) : vistaTabla ? (
        <TablaMarcas
          marcas={marcasPaginadas}
          abrirModalEdicion={(m) => { setMarcaEditar(m); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(m) => { setMarcaAEliminar(m); setMostrarModalEliminacion(true); }}
          copiarMarca={copiarMarca}
        />
      ) : (
        <TarjetaMarca
          marcas={marcasPaginadas}
          abrirModalEdicion={(m) => { setMarcaEditar(m); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(m) => { setMarcaAEliminar(m); setMostrarModalEliminacion(true); }}
          copiarMarca={copiarMarca}
        />
      )}

      {marcasFiltradas.length > registrosPorPagina && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Paginacion
              totalRegistros={marcasFiltradas.length}
              registrosPorPagina={registrosPorPagina}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modales */}
      <ModalRegistroMarca
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevaMarca={nuevaMarca}
        manejoCambioInput={manejoCambioInput}
        guardarMarca={guardarMarca}
      />

      <ModalEdicionMarca
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        marcaEditar={marcaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarMarca={actualizarMarca}
      />

      <ModalEliminacionMarca
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        marcaAEliminar={marcaAEliminar}
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

export default Marcas;
