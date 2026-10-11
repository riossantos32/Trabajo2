import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaInventario from "../components/inventario/TablaInventario";
import TarjetaInventario from "../components/inventario/TarjetaInventario";
import ModalRegistroInventario from "../components/inventario/ModalRegistroInventario";
import ModalEdicionInventario from "../components/inventario/ModalEdicionInventario";
import ModalEliminacionInventario from "../components/inventario/ModalEliminacionInventario";

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [inventarioFiltrado, setInventarioFiltrado] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [inventarioEditar, setInventarioEditar] = useState({
    id: "",
    producto_id: "",
    cantidad_disponible: 0,
    costo_unitario_promedio: 0,
    fecha_vencimiento: "",
    ubicacion_estante: ""
  });
  const [inventarioAEliminar, setInventarioAEliminar] = useState(null);
  const [nuevoInventario, setNuevoInventario] = useState({
    producto_id: "",
    cantidad_disponible: 0,
    costo_unitario_promedio: 0,
    fecha_vencimiento: "",
    ubicacion_estante: ""
  });

  // Notificaciones, búsqueda y paginación
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [invResp, prodResp] = await Promise.all([
        supabase.from("inventario").select("*, productos (*)").order("cantidad_disponible", { ascending: true }),
        supabase.from("productos").select("*").order("nombre_comercial")
      ]);

      if (invResp.error) throw invResp.error;
      setInventario(invResp.data || []);
      setInventarioFiltrado(invResp.data || []);
      setProductos(prodResp.data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al cargar inventario: ${err.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const q = textoBusqueda.toLowerCase().trim();
    if (!q) {
      setInventarioFiltrado(inventario);
    } else {
      setInventarioFiltrado(
        inventario.filter((item) => {
          const nombre = item.productos?.nombre_comercial || item.productos?.nombre_producto || "";
          const codigo = item.productos?.codigo_barra || "";
          const estante = item.ubicacion_estante || "";
          return (
            nombre.toLowerCase().includes(q) ||
            codigo.toLowerCase().includes(q) ||
            estante.toLowerCase().includes(q)
          );
        })
      );
    }
    establecerPaginaActual(1);
  }, [textoBusqueda, inventario]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const inventarioPaginado = inventarioFiltrado.slice(indicePrimero, indiceUltimo);

  const manejoCambioInput = (e) => {
    setNuevoInventario({ ...nuevoInventario, [e.target.name]: e.target.value });
  };

  const manejoCambioInputEdicion = (e) => {
    setInventarioEditar({ ...inventarioEditar, [e.target.name]: e.target.value });
  };

  const guardarInventario = async (e) => {
    e.preventDefault();
    if (!nuevoInventario.producto_id) {
      setToast({ mostrar: true, mensaje: "Debe seleccionar un producto.", tipo: "advertencia" });
      return;
    }

    try {
      const payload = {
        producto_id: nuevoInventario.producto_id,
        cantidad_disponible: Number(nuevoInventario.cantidad_disponible || 0),
        costo_unitario_promedio: Number(nuevoInventario.costo_unitario_promedio || 0),
        fecha_vencimiento: nuevoInventario.fecha_vencimiento || null,
        ubicacion_estante: nuevoInventario.ubicacion_estante || null
      };

      const { error } = await supabase.from("inventario").insert([payload]);
      if (error) throw error;

      setMostrarModalRegistro(false);
      setNuevoInventario({
        producto_id: "",
        cantidad_disponible: 0,
        costo_unitario_promedio: 0,
        fecha_vencimiento: "",
        ubicacion_estante: ""
      });
      setToast({ mostrar: true, mensaje: "Stock registrado con éxito.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al registrar: ${err.message}`, tipo: "error" });
    }
  };

  const actualizarInventario = async () => {
    if (!inventarioEditar.producto_id) return;

    try {
      const payload = {
        producto_id: inventarioEditar.producto_id,
        cantidad_disponible: Number(inventarioEditar.cantidad_disponible || 0),
        costo_unitario_promedio: Number(inventarioEditar.costo_unitario_promedio || 0),
        fecha_vencimiento: inventarioEditar.fecha_vencimiento || null,
        ubicacion_estante: inventarioEditar.ubicacion_estante || null
      };

      const { error } = await supabase
        .from("inventario")
        .update(payload)
        .eq("id", inventarioEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Inventario actualizado correctamente.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
    }
  };

  const confirmarEliminacion = async () => {
    if (!inventarioAEliminar) return;

    try {
      const { error } = await supabase.from("inventario").delete().eq("id", inventarioAEliminar.id);
      if (error) throw error;

      setMostrarModalEliminacion(false);
      setInventarioAEliminar(null);
      setToast({ mostrar: true, mensaje: "Registro de inventario eliminado.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al eliminar: ${err.message}`, tipo: "error" });
    }
  };

  const copiarInventario = (item) => {
    const nom = item.productos?.nombre_comercial || "Producto";
    navigator.clipboard.writeText(`Producto: ${nom} | Stock: ${item.cantidad_disponible} | Estante: ${item.ubicacion_estante || 'N/A'}`);
    setToast({ mostrar: true, mensaje: "Datos copiados al portapapeles.", tipo: "exito" });
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6}>
          <h2 className="mb-1 text-primary">
            <Icono nombre="inventario" size={21} className="me-2" />Control de Inventario
          </h2>
          <p className="text-muted mb-0">Gestión de existencias, estantes y lotes en Farmacia Dassy</p>
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
            <Icono nombre="mas" size={16} className="me-1" /> Registrar Stock
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={8}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por producto, código o estante..."
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0 text-muted">
          <span>Registros: <strong>{inventarioFiltrado.length}</strong></span>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando existencias de inventario...</p>
        </div>
      ) : vistaTabla ? (
        <TablaInventario
          inventario={inventarioPaginado}
          abrirModalEdicion={(item) => { setInventarioEditar(item); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(item) => { setInventarioAEliminar(item); setMostrarModalEliminacion(true); }}
          copiarInventario={copiarInventario}
        />
      ) : (
        <TarjetaInventario
          inventario={inventarioPaginado}
          abrirModalEdicion={(item) => { setInventarioEditar(item); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(item) => { setInventarioAEliminar(item); setMostrarModalEliminacion(true); }}
          copiarInventario={copiarInventario}
        />
      )}

      {inventarioFiltrado.length > registrosPorPagina && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Paginacion
              totalRegistros={inventarioFiltrado.length}
              registrosPorPagina={registrosPorPagina}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modales */}
      <ModalRegistroInventario
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevoInventario={nuevoInventario}
        manejoCambioInput={manejoCambioInput}
        guardarInventario={guardarInventario}
        productos={productos}
      />

      <ModalEdicionInventario
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        inventarioEditar={inventarioEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarInventario={actualizarInventario}
        productos={productos}
      />

      <ModalEliminacionInventario
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        inventarioAEliminar={inventarioAEliminar}
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

export default Inventario;
