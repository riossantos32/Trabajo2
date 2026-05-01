import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminarProducto from "../components/productos/ModalEliminacionProducto";
import TarjetasProductos from "../components/productos/TarjetasProductos";
import TablaProductos from "../components/productos/TablaProductos";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Productos = () => {

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]); // Requerido por la guía
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null, 
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  // --- Manejadores de Input ---
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // --- Carga de Datos ---
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });

      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al cargar productos.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error categorías:", err.message);
    }
  };

  // --- Lógica de Búsqueda (useEffect) ---
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const desc = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";
        return nombre.includes(textoLower) || desc.includes(textoLower) || precio.includes(textoLower);
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  
  const agregarProducto = async () => {
    try {
      if (!nuevoProducto.nombre_producto || !nuevoProducto.categoria_producto || !nuevoProducto.precio_venta || !nuevoProducto.archivo) {
        setToast({ mostrar: true, mensaje: "Completa los campos obligatorios.", tipo: "advertencia" });
        return;
      }

      setMostrarModal(false);
      
      // 1. Subir Imagen a Storage
      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      // 2. Obtener URL Pública
      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);
      
      const urlPublica = urlData.publicUrl;

      // 3. Insertar en Base de Datos
      const { error } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto: nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Producto registrado correctamente.", tipo: "exito" });
      setNuevoProducto({ nombre_producto: "", descripcion_producto: "", categoria_producto: "", precio_venta: "", archivo: null });
      await cargarProductos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar el producto.", tipo: "error" });
    }
  };

  // --- Resto de funciones (Edición y Eliminación) ---
  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto,
      descripcion_producto: producto.descripcion_producto,
      categoria_producto: producto.categoria_producto,
      precio_venta: producto.precio_venta,
      url_imagen: producto.url_imagen,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const eliminarProducto = async () => {
    try {
      const { error } = await supabase.from("productos").delete().eq("id_producto", productoAEliminar.id_producto);
      if (error) throw error;
      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Producto eliminado.", tipo: "exito" });
      await cargarProductos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar.", tipo: "error" });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-items-center">
          <h3 className="mb-0"><i className="bi-bag-heart-fill me-2"></i> Productos</h3>
        </Col>
        <Col xs={3} className="text-end">
          <Button onClick={() => setMostrarModal(true)}>
            <i className="bi-plus-lg"></i> <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>
      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas 
            textoBusqueda={textoBusqueda} 
            manejarCambioBusqueda={manejarBusqueda} 
            placeholder="Buscar por nombre, descripción o precio..." 
          />
        </Col>
      </Row>

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        categorias={categorias}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
      />

      <ModalEliminarProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
        producto={productoAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      {cargando ? (
        <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <div className="d-lg-none">
            <TarjetasProductos productos={productosFiltrados} abrirModalEdicion={abrirModalEdicion} abrirModalEliminacion={abrirModalEliminacion} />
          </div>
          <div className="d-none d-lg-block">
            <TablaProductos productos={productosFiltrados} abrirModalEdicion={abrirModalEdicion} abrirModalEliminacion={abrirModalEliminacion} />
          </div>
        </>
      )}
    </Container>
  );
};

export default Productos;