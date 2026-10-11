import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaVentas from "../components/ventas/TablaVentas";
import TarjetaVenta from "../components/ventas/TarjetaVenta";
import FormularioVenta from "../components/ventas/FormularioVenta";

const Ventas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // Cargar datos
  const cargarDatosAuxiliares = async () => {
    try {
      const [c, e, p, perf] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("empleados").select("*"),
        supabase.from("productos").select("*"),
        supabase.from("perfiles").select("*")
      ]);

      const prods = (p.data || []).map((item) => ({
        ...item,
        id_producto: item.id_producto || item.id,
        nombre_producto: item.nombre_producto || item.nombre_comercial || "Sin nombre",
        precio_venta: item.precio_venta != null ? Number(item.precio_venta) : Number(item.precio_venta_sugerido || 0)
      }));
      setProductos(prods);

      if (c.data && c.data.length > 0) {
        setClientes(c.data);
      } else {
        const clientesPerfiles = (perf.data || []).map((usr) => ({
          id_cliente: usr.id_usuario,
          nombre_cliente: usr.nombre_completo || usr.correo,
          apellido_cliente: ""
        }));
        setClientes(clientesPerfiles);
      }

      if (e.data && e.data.length > 0) {
        setEmpleados(e.data);
      } else {
        const empleadosPerfiles = (perf.data || []).map((usr) => ({
          id_empleado: usr.id_usuario,
          nombre_empleado: usr.nombre_completo || usr.correo,
          apellido_empleado: ""
        }));
        setEmpleados(empleadosPerfiles);
      }
    } catch (err) {
      console.error("Error cargando auxiliares:", err);
    }
  };

  const cargarVentas = async () => {
    try {
      setCargando(true);
      let { data, error } = await supabase
        .from("ventas")
        .select(`
          *,
          clientes (nombre_cliente, apellido_cliente),
          empleados (nombre_empleado, apellido_empleado),
          detalles_ventas (*, productos (nombre_producto))
        `)
        .order("fecha_venta", { ascending: false });

      if (error) {
        const [vResp, detResp, prodResp, perfResp] = await Promise.all([
          supabase.from("ventas").select("*").order("fecha_venta", { ascending: false }),
          supabase.from("detalle_ventas").select("*"),
          supabase.from("productos").select("*"),
          supabase.from("perfiles").select("*")
        ]);

        if (vResp.error) throw vResp.error;

        const mapaProds = new Map(
          (prodResp.data || []).map((pr) => [pr.id || pr.id_producto, pr.nombre_comercial || pr.nombre_producto])
        );
        const mapaPerfs = new Map(
          (perfResp.data || []).map((pe) => [pe.id_usuario, pe.nombre_completo || pe.correo])
        );

        data = (vResp.data || []).map((v) => {
          const vId = v.id || v.id_venta;
          const clienteNom = mapaPerfs.get(v.usuario_id) || "Cliente";
          const detallesVenta = (detResp.data || [])
            .filter((d) => (d.venta_id || d.id_venta) === vId)
            .map((d) => ({
              ...d,
              id_producto: d.producto_id || d.id_producto,
              precio_unitario: d.precio_unitario,
              cantidad: d.cantidad,
              productos: {
                nombre_producto: mapaProds.get(d.producto_id || d.id_producto) || "Producto"
              }
            }));

          return {
            ...v,
            id_venta: vId,
            total: v.total != null ? v.total : v.total_venta,
            clientes: { nombre_cliente: clienteNom, apellido_cliente: "" },
            empleados: { nombre_empleado: "Caja Principal", apellido_empleado: "" },
            detalles_ventas: detallesVenta
          };
        });
      }

      setVentas(data || []);
      setVentasFiltradas(data || []);
    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: `Error al cargar ventas: ${err.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
    cargarDatosAuxiliares();
  }, []);

  // Precargar formulario al editar
  useEffect(() => {
    if (ventaAEditar) {
      const cliente = clientes.find(c => c.id_cliente === ventaAEditar.id_cliente);
      const empleado = empleados.find(e => e.id_empleado === ventaAEditar.id_empleado);

      setClienteSeleccionado(cliente || null);
      setEmpleadoSeleccionado(empleado || null);
      setMetodoPago(ventaAEditar.metodo_pago || "efectivo");

      if (ventaAEditar.detalles_ventas?.length > 0) {
        const detallesFormateados = ventaAEditar.detalles_ventas.map(d => ({
          id_producto: d.id_producto,
          nombre_producto: d.productos?.nombre_producto || "Producto",
          precio: d.precio_unitario,
          cantidad: d.cantidad
        }));
        setDetalles(detallesFormateados);
      } else {
        setDetalles([]);
      }
    }
  }, [ventaAEditar, clientes, empleados]);

  // Calcular total
  useEffect(() => {
    const total = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio), 0);
    setTotalGeneral(total);
  }, [detalles]);

  // Búsqueda
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtradas = ventas.filter(v =>
        `${v.clientes?.nombre_cliente || ''} ${v.clientes?.apellido_cliente || ''}`.toLowerCase().includes(textoLower) ||
        v.empleados?.nombre_empleado?.toLowerCase().includes(textoLower)
      );
      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

  const abrirNuevaVenta = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirEdicion = (venta) => {
    setVentaAEditar(venta);
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setClienteSeleccionado(null);
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setVentaAEditar(null);
  };

  const agregarDetalle = (producto, cantidad) => {
    if (!producto || !cantidad) return;
    setDetalles(prev => {
      const existe = prev.find(d => d.id_producto === producto.id_producto);
      if (existe) {
        return prev.map(d =>
          d.id_producto === producto.id_producto ? { ...d, cantidad: d.cantidad + cantidad } : d
        );
      }
      return [...prev, {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio: producto.precio_venta,
        cantidad
      }];
    });
  };

  const eliminarDetalle = (id_producto) => {
    setDetalles(prev => prev.filter(d => d.id_producto !== id_producto));
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setDetalles(prev => prev.map(d =>
      d.id_producto === id_producto ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  const guardarVenta = async () => {
    if (!clienteSeleccionado || !empleadoSeleccionado || detalles.length === 0) {
      setToast({ mostrar: true, mensaje: "Faltan datos obligatorios", tipo: "advertencia" });
      return;
    }

    try {
      if (ventaAEditar) {
        // === ACTUALIZAR ===
        const vId = ventaAEditar.id || ventaAEditar.id_venta;

        let { error } = await supabase.from("ventas").update({
          usuario_id: clienteSeleccionado.id_cliente,
          metodo_pago: metodoPago,
          total_venta: totalGeneral
        }).eq("id", vId);

        if (error) {
          await supabase.from("ventas").update({
            id_cliente: clienteSeleccionado.id_cliente,
            id_empleado: empleadoSeleccionado.id_empleado,
            metodo_pago: metodoPago,
            total: totalGeneral
          }).eq("id_venta", vId);
        }

        // Eliminar detalles previos
        await supabase.from("detalle_ventas").delete().eq("venta_id", vId);
        await supabase.from("detalles_ventas").delete().eq("id_venta", vId);

        const detallesDassy = detalles.map(d => ({
          venta_id: vId,
          producto_id: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio,
          subtotal: d.cantidad * d.precio
        }));

        let { error: errDet } = await supabase.from("detalle_ventas").insert(detallesDassy);
        if (errDet) {
          const detallesTrad = detalles.map(d => ({
            id_venta: vId,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio,
            subtotal: d.cantidad * d.precio
          }));
          await supabase.from("detalles_ventas").insert(detallesTrad);
        }

        setToast({ mostrar: true, mensaje: "Venta actualizada exitosamente", tipo: "exito" });
      } else {
        // === NUEVA VENTA ===
        const nicaNow = () => new Date().toLocaleString("sv", { timeZone: "America/Managua" }).replace(" ", "T");

        let ventaId = null;

        // Intentar Dassydata schema
        const { data: vDataDassy, error: vErrDassy } = await supabase
          .from("ventas")
          .insert([{
            usuario_id: clienteSeleccionado.id_cliente,
            fecha_venta: new Date().toISOString(),
            metodo_pago: metodoPago,
            total_venta: totalGeneral,
            observaciones: "Venta registrada desde punto de venta"
          }])
          .select()
          .single();

        if (!vErrDassy && vDataDassy) {
          ventaId = vDataDassy.id;
        } else {
          // Intentar esquema tradicional
          const { data: vDataTrad } = await supabase
            .from("ventas")
            .insert([{
              id_cliente: clienteSeleccionado.id_cliente,
              id_empleado: empleadoSeleccionado.id_empleado,
              fecha_venta: nicaNow(),
              metodo_pago: metodoPago,
              total: totalGeneral
            }])
            .select()
            .single();
          ventaId = vDataTrad?.id_venta || vDataTrad?.id;
        }

        if (ventaId) {
          const detallesDassy = detalles.map(d => ({
            venta_id: ventaId,
            producto_id: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio,
            subtotal: d.cantidad * d.precio
          }));

          let { error: errDet } = await supabase.from("detalle_ventas").insert(detallesDassy);
          if (errDet) {
            const detallesTrad = detalles.map(d => ({
              id_venta: ventaId,
              id_producto: d.id_producto,
              cantidad: d.cantidad,
              precio_unitario: d.precio,
              subtotal: d.cantidad * d.precio
            }));
            await supabase.from("detalles_ventas").insert(detallesTrad);
          }
        }

        setToast({ mostrar: true, mensaje: "Venta registrada exitosamente", tipo: "exito" });
      }

      resetFormulario();
      setMostrarFormulario(false);
      await cargarVentas();

    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error al guardar la venta", tipo: "error" });
    }
  };

  const manejarBusqueda = (e) => setTextoBusqueda(e.target.value);

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={8} lg={8}>
          <h3 className="mb-0">
            <Icono nombre="venta" size={21} className="me-2" /> Ventas
          </h3>
        </Col>
        <Col xs={4} lg={4} className="text-end">
          <Button onClick={abrirNuevaVenta} size="md">
            <Icono nombre="mas" size={16} />
            <span className="d-none d-sm-inline ms-2">Nueva Venta</span>
          </Button>
        </Col>
      </Row>
      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por cliente o empleado..."
          />
        </Col>
      </Row>

      {cargando ? (
        <Row className="text-center my-5">
          <Spinner animation="border" variant="success" size="lg" />
          <p className="mt-3 text-muted">Cargando ventas...</p>
        </Row>
      ) : (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaVenta ventas={ventasPaginadas} abrirEdicion={abrirEdicion} />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaVentas ventas={ventasPaginadas} abrirEdicion={abrirEdicion} />
          </Col>
        </Row>
      )}

      {ventasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={ventasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <FormularioVenta
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarVenta={guardarVenta}
        ventaAEditar={ventaAEditar}
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

export default Ventas;