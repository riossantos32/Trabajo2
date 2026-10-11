import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaCompras from "../components/compras/TablaCompras";
import TarjetaCompra from "../components/compras/TarjetaCompra";
import ModalRegistroCompra from "../components/compras/ModalRegistroCompra";
import ModalEdicionCompra from "../components/compras/ModalEdicionCompra";
import ModalEliminacionCompra from "../components/compras/ModalEliminacionCompra";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [compraEditar, setCompraEditar] = useState({
    id: "",
    proveedor_id: "",
    fecha_compra: new Date().toISOString().slice(0, 10),
    total_compra: 0,
    numero_factura_proveedor: "",
    estado: "solicitado"
  });
  const [compraAEliminar, setCompraAEliminar] = useState(null);
  const [nuevaCompra, setNuevaCompra] = useState({
    proveedor_id: "",
    fecha_compra: new Date().toISOString().slice(0, 10),
    total_compra: 0,
    numero_factura_proveedor: "",
    estado: "solicitado"
  });

  // Notificaciones, búsqueda y paginación
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [compResp, provResp] = await Promise.all([
        supabase.from("compras").select("*, proveedores (*)").order("fecha_compra", { ascending: false }),
        supabase.from("proveedores").select("*").order("nombre")
      ]);

      if (compResp.error) throw compResp.error;
      setCompras(compResp.data || []);
      setComprasFiltradas(compResp.data || []);
      setProveedores(provResp.data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al cargar compras: ${err.message}`, tipo: "error" });
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
      setComprasFiltradas(compras);
    } else {
      setComprasFiltradas(
        compras.filter((c) => {
          const prov = c.proveedores?.nombre || "";
          const fact = c.numero_factura_proveedor || "";
          const est = c.estado || "";
          return prov.toLowerCase().includes(q) || fact.toLowerCase().includes(q) || est.toLowerCase().includes(q);
        })
      );
    }
    establecerPaginaActual(1);
  }, [textoBusqueda, compras]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const comprasPaginadas = comprasFiltradas.slice(indicePrimero, indiceUltimo);

  const manejoCambioInput = (e) => {
    setNuevaCompra({ ...nuevaCompra, [e.target.name]: e.target.value });
  };

  const manejoCambioInputEdicion = (e) => {
    setCompraEditar({ ...compraEditar, [e.target.name]: e.target.value });
  };

  const guardarCompra = async (e) => {
    e.preventDefault();
    if (!nuevaCompra.proveedor_id) {
      setToast({ mostrar: true, mensaje: "Debe seleccionar un proveedor.", tipo: "advertencia" });
      return;
    }

    try {
      const payload = {
        proveedor_id: nuevaCompra.proveedor_id,
        fecha_compra: nuevaCompra.fecha_compra || new Date().toISOString(),
        total_compra: Number(nuevaCompra.total_compra || 0),
        numero_factura_proveedor: nuevaCompra.numero_factura_proveedor || null,
        estado: nuevaCompra.estado || "solicitado"
      };

      const { error } = await supabase.from("compras").insert([payload]);
      if (error) throw error;

      setMostrarModalRegistro(false);
      setNuevaCompra({
        proveedor_id: "",
        fecha_compra: new Date().toISOString().slice(0, 10),
        total_compra: 0,
        numero_factura_proveedor: "",
        estado: "solicitado"
      });
      setToast({ mostrar: true, mensaje: "Compra registrada con éxito.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al registrar compra: ${err.message}`, tipo: "error" });
    }
  };

  const actualizarCompra = async () => {
    if (!compraEditar.proveedor_id) return;

    try {
      const payload = {
        proveedor_id: compraEditar.proveedor_id,
        fecha_compra: compraEditar.fecha_compra || new Date().toISOString(),
        total_compra: Number(compraEditar.total_compra || 0),
        numero_factura_proveedor: compraEditar.numero_factura_proveedor || null,
        estado: compraEditar.estado || "solicitado"
      };

      const { error } = await supabase
        .from("compras")
        .update(payload)
        .eq("id", compraEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Compra actualizada correctamente.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
    }
  };

  const confirmarEliminacion = async () => {
    if (!compraAEliminar) return;

    try {
      const { error } = await supabase.from("compras").delete().eq("id", compraAEliminar.id);
      if (error) throw error;

      setMostrarModalEliminacion(false);
      setCompraAEliminar(null);
      setToast({ mostrar: true, mensaje: "Compra eliminada con éxito.", tipo: "exito" });
      cargarDatos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al eliminar: ${err.message}`, tipo: "error" });
    }
  };

  const copiarCompra = (c) => {
    const prov = c.proveedores?.nombre || "N/A";
    navigator.clipboard.writeText(`Compra a: ${prov} | Factura: ${c.numero_factura_proveedor || 'N/A'} | Total: C$${c.total_compra}`);
    setToast({ mostrar: true, mensaje: "Datos copiados al portapapeles.", tipo: "exito" });
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6}>
          <h2 className="mb-1 text-primary">
            <Icono nombre="compra" size={21} className="me-2" />Gestión de Compras
          </h2>
          <p className="text-muted mb-0">Adquisición de productos y facturas a proveedores en Farmacia Dassy</p>
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
            <Icono nombre="mas" size={16} className="me-1" /> Nueva Compra
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={8}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por proveedor, n° de factura o estado..."
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0 text-muted">
          <span>Compras: <strong>{comprasFiltradas.length}</strong></span>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando compras de Farmacia Dassy...</p>
        </div>
      ) : vistaTabla ? (
        <TablaCompras
          compras={comprasPaginadas}
          abrirModalEdicion={(c) => { setCompraEditar(c); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(c) => { setCompraAEliminar(c); setMostrarModalEliminacion(true); }}
          copiarCompra={copiarCompra}
        />
      ) : (
        <TarjetaCompra
          compras={comprasPaginadas}
          abrirModalEdicion={(c) => { setCompraEditar(c); setMostrarModalEdicion(true); }}
          abrirModalEliminacion={(c) => { setCompraAEliminar(c); setMostrarModalEliminacion(true); }}
          copiarCompra={copiarCompra}
        />
      )}

      {comprasFiltradas.length > registrosPorPagina && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Paginacion
              totalRegistros={comprasFiltradas.length}
              registrosPorPagina={registrosPorPagina}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modales */}
      <ModalRegistroCompra
        mostrarModal={mostrarModalRegistro}
        setMostrarModal={setMostrarModalRegistro}
        nuevaCompra={nuevaCompra}
        manejoCambioInput={manejoCambioInput}
        guardarCompra={guardarCompra}
        proveedores={proveedores}
      />

      <ModalEdicionCompra
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        compraEditar={compraEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCompra={actualizarCompra}
        proveedores={proveedores}
      />

      <ModalEliminacionCompra
        mostrarModal={mostrarModalEliminacion}
        setMostrarModal={setMostrarModalEliminacion}
        compraAEliminar={compraAEliminar}
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

export default Compras;
