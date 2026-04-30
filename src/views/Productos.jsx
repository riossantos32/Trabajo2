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
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [nuevoProducto, setNuevoProducto] = useState({
    nombreProducto: "",
    descripcion: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombreProducto: "",
    descripcion: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
  });

  // Manejo de inputs (para nuevo y edición)
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  // Convertir archivo a Base64
  const manejoCambioArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const convertirArchivoABase64 = (archivoLocal) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(archivoLocal);
      });

    try {
      const base64 = await convertirArchivoABase64(archivo);
      setNuevoProducto((prev) => ({ ...prev, url_imagen: base64 }));
    } catch (error) {
      console.error("Error al leer la imagen:", error);
      setToast({ mostrar: true, mensaje: "No se pudo leer la imagen seleccionada.", tipo: "error" });
    }
  };

  const manejoCambioArchivoEdicion = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const convertirArchivoABase64 = (archivoLocal) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(archivoLocal);
      });

    try {
      const base64 = await convertirArchivoABase64(archivo);
      setProductoEditar((prev) => ({ ...prev, url_imagen: base64 }));
    } catch (error) {
      console.error("Error al leer la imagen:", error);
      setToast({ mostrar: true, mensaje: "No se pudo leer la imagen seleccionada.", tipo: "error" });
    }
  };

  const manejarCambioBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });

      if (error) throw error;
      const productosNormalizados = (data || []).map((producto) => ({
        ...producto,
        nombreProducto: producto.nombreProducto || producto.nombre_producto || "",
        precio: producto.precio ?? producto.precio_venta ?? "",
        imagen: producto.imagen || producto.url_imagen || "",
      }));
      setProductos(productosNormalizados);
    } catch (err) {
      console.error("Error cargando productos:", err.message);
      setToast({ mostrar: true, mensaje: "Error al cargar productos.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("id_categoria, nombre_categoria")
        .order("nombre_categoria", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error cargando categorías:", err.message);
      setToast({ mostrar: true, mensaje: "Error al cargar categorías.", tipo: "error" });
    }
  };

  // ====================== AGREGAR PRODUCTO ======================
  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombreProducto.trim() ||
        !nuevoProducto.descripcion.trim() ||
        !nuevoProducto.categoria_producto.toString().trim() ||
        !nuevoProducto.precio_venta.toString().trim() ||
        !nuevoProducto.url_imagen.trim()
      ) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("productos").insert([
        {
          nombreProducto: nuevoProducto.nombreProducto,
          descripcion: nuevoProducto.descripcion,
          categoria_producto: Number(nuevoProducto.categoria_producto),
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: nuevoProducto.url_imagen,
        },
      ]);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Producto registrado exitosamente.", tipo: "exito" });
      setNuevoProducto({ nombreProducto: "", descripcion: "", categoria_producto: "", precio_venta: "", url_imagen: "" });
      setMostrarModal(false);
      await cargarProductos();
    } catch (err) {
      console.error("Error registrando producto:", err.message);
      setToast({ mostrar: true, mensaje: "Error al registrar el producto.", tipo: "error" });
    }
  };

  // ====================== ACTUALIZAR PRODUCTO ======================
  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombreProducto.trim() ||
        !productoEditar.descripcion.trim() ||
        !productoEditar.categoria_producto.toString().trim() ||
        !productoEditar.precio_venta.toString().trim() ||
        !productoEditar.url_imagen.trim()
      ) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase
        .from("productos")
        .update({
          nombre_producto: productoEditar.nombreProducto,
          descripcion: productoEditar.descripcion,
          id_categoria: Number(productoEditar.categoria_producto),
          precio_venta: parseFloat(productoEditar.precio_venta),
          url_imagen: productoEditar.url_imagen,
        })
        .eq("id_producto", productoEditar.id_producto);

      if (error) {
        console.error("Error al actualizar producto:", error.message);
        setToast({ mostrar: true, mensaje: "Error al actualizar el producto.", tipo: "error" });
        return;
      }

      setMostrarModalEdicion(false);
      await cargarProductos();
      setToast({ mostrar: true, mensaje: `Producto ${productoEditar.nombreProducto} actualizado.`, tipo: "exito" });
    } catch (err) {
      console.error("Excepción al actualizar producto:", err.message);
      setToast({ mostrar: true, mensaje: "Error inesperado al actualizar producto.", tipo: "error" });
    }
  };

  // ====================== ELIMINAR PRODUCTO ======================
  const eliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      setMostrarModalEliminacion(false);
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id_producto", productoAEliminar.id_producto);

      if (error) throw error;

      await cargarProductos();
      setToast({
        mostrar: true,
        mensaje: `Producto ${productoAEliminar.nombreProducto || productoAEliminar.nombreProducto} eliminado.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error eliminando producto:", err.message);
      setToast({ mostrar: true, mensaje: "Error al eliminar el producto.", tipo: "error" });
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_producto: producto.id_producto,
      nombreProducto: producto.nombreProducto || producto.nombre_producto || "",
      descripcion: producto.descripcion,
      categoria_producto: producto.id_categoria || producto.categoria_producto || "",
      precio: producto.precio_venta ?? producto.precio ?? "",
      url_imagen: producto.url_imagen || producto.imagen || "",
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const productosFiltrados = productos.filter((producto) => {
    const busqueda = textoBusqueda.toLowerCase();
    const nombreProducto = (producto.nombreProducto || producto.nombre_producto || "").toLowerCase();
    const descripcion = (producto.descripcion || "").toLowerCase();
    const precio = (producto.precio_venta ?? producto.precio ?? "").toString().toLowerCase();
    return (
      nombreProducto.includes(busqueda) ||
      descripcion.includes(busqueda) ||
      precio.includes(busqueda)
    );
  });

  return (
    <Container>
      <br />
      <Row className="align-items-center mb-3">
        <Col xs={9}>
          <h3>
            <i className="bi-bag-fill me-2"></i> Productos
          </h3>
        </Col>
        <Col xs={3} className="text-end">
          <Button onClick={() => setMostrarModal(true)}>
            <i className="bi-plus-lg"></i> <span className="d-none d-sm-inline">Nuevo</span>
          </Button>
        </Col>
      </Row>
      <hr />

      <Row className="mb-3">
        <Col>
          <CuadroBusquedas textoBusqueda={textoBusqueda} manejarCambioBusqueda={manejarCambioBusqueda} />
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

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        categorias={categorias}
        manejarCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
        actualizarProducto={actualizarProducto}
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
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <div className="d-lg-none">
            <TarjetasProductos
              productos={productosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              categorias={categorias}
            />
          </div>

          <div className="d-none d-lg-block">
            <TablaProductos
              productos={productosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              categorias={categorias}
            />
          </div>

          {productosFiltrados.length === 0 && !cargando && (
            <p className="text-center">
              {textoBusqueda
                ? "No se encontraron productos que coincidan con la búsqueda."
                : "No hay datos."}
            </p>
          )}
        </>
      )}
    </Container>
  );
};

export default Productos;