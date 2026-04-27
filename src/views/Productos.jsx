import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../database/supabaseconfig';
import NotificacionOperacion from '../components/NotificacionOperacion';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';
import Paginacion from '../components/ordenamiento/Paginacion';
import ModalRegistroProducto from '../components/productos/ModalRegistroProducto';
import ModalEdicionProducto from '../components/productos/ModalEdicionProducto';
import ModalEliminacionProducto from '../components/productos/ModalEliminacionProducto';
import TarjetasProductos from '../components/productos/TarjetasProductos';
import TablaProductos from '../components/productos/TablaProductos';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [archivoImagenEditar, setArchivoImagenEditar] = useState(null);

  const [productoEditar, setProductoEditar] = useState({
    id_producto: '',
    nombreProducto: '',
    categoria_producto: '',
    descripcion: '',
    precio: '',
    imagen: '',
    id_categoria: '',
  });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombreProducto: '',
    categoria_producto: '',
    descripcion: '',
    precio: '',
    imagen: '',
    id_categoria: '',
  });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejarCambioArchivo = (e) => {
    setArchivoImagen(e.target.files?.[0] || null);
  };

  const manejarCambioArchivoEdicion = (e) => {
    setArchivoImagenEditar(e.target.files?.[0] || null);
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('id_categoria', { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err.message);
    }
  };

  const subirImagen = async (archivo) => {
    if (!archivo) {
      throw new Error('No se ha seleccionado una imagen.');
    }

    const nombreUnico = `${Date.now()}_${archivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from('imagenes_productos')
      .upload(nombreUnico, archivo, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from('imagenes_productos')
      .getPublicUrl(nombreUnico);

    if (urlError) {
      throw urlError;
    }

    return urlData.publicUrl;
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id_producto', { ascending: true });

      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err.message);
      setToast({ mostrar: true, mensaje: 'Error al cargar productos.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombreProducto.trim() ||
         !nuevoProducto.categoria_producto.trim() ||
        !nuevoProducto.descripcion.trim() ||
        !nuevoProducto.precio.toString().trim() ||
        !nuevoProducto.id_categoria ||
        !archivoImagen
      ) {
        setToast({ mostrar: true, mensaje: 'Debe llenar todos los campos.', tipo: 'advertencia' });
        return;
      }

      const precioNumero = parseFloat(nuevoProducto.precio);
      if (isNaN(precioNumero) || precioNumero < 0) {
        setToast({ mostrar: true, mensaje: 'Ingrese un precio válido.', tipo: 'advertencia' });
        return;
      }

      const urlPublica = await subirImagen(archivoImagen);

      const { error } = await supabase.from('productos').insert([
        {
          nombre_producto: nuevoProducto.nombreProducto,
          categoria_producto: nuevoProducto.id_categoria,
          descripcion: nuevoProducto.descripcion,
          precio: precioNumero,
          imagen: urlPublica,
          categoria_producto: nuevoProducto.id_categoria,
        },
      ]);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: 'Producto registrado exitosamente.', tipo: 'exito' });
      setNuevoProducto({ nombreProducto: '', categoria_producto: '', descripcion: '', precio: '', imagen: '', id_categoria: '' });
      setArchivoImagen(null);
      setMostrarModal(false);
      await cargarProductos();
    } catch (err) {
      console.error('Error al agregar producto:', err.message);
      setToast({ mostrar: true, mensaje: 'Error al registrar el producto.', tipo: 'error' });
    }
  };

  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombreProducto.trim() ||
          !productoEditar.categoria_producto.trim() ||
        !productoEditar.descripcion.trim() ||
        !productoEditar.precio.toString().trim() ||
        !productoEditar.id_categoria ||
        (!productoEditar.imagen && !archivoImagenEditar)
      ) {
        setToast({ mostrar: true, mensaje: 'Debe llenar todos los campos.', tipo: 'advertencia' });
        return;
      }

      const precioNumero = parseFloat(productoEditar.precio);
      if (isNaN(precioNumero) || precioNumero < 0) {
        setToast({ mostrar: true, mensaje: 'Ingrese un precio válido.', tipo: 'advertencia' });
        return;
      }

      setMostrarModalEdicion(false);
      let imagenActual = productoEditar.imagen;

      if (archivoImagenEditar) {
        imagenActual = await subirImagen(archivoImagenEditar);
      }

      const { error } = await supabase
        .from('productos')
        .update({
          nombre_producto: productoEditar.nombreProducto,
          categoria_producto: productoEditar.categoria_producto,
          descripcion: productoEditar.descripcion,
          precio: precioNumero,
          imagen: imagenActual,
          categoria_producto: productoEditar.id_categoria,
        })
        .eq('id_producto', productoEditar.id_producto);

      if (error) {
        throw error;
      }

      setToast({ mostrar: true, mensaje: 'Producto actualizado exitosamente.', tipo: 'exito' });
      setArchivoImagenEditar(null);
      await cargarProductos();
    } catch (err) {
      console.error('Error al actualizar producto:', err.message);
      setToast({ mostrar: true, mensaje: 'Error al actualizar el producto.', tipo: 'error' });
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      setMostrarModalEliminacion(false);
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id_producto', productoAEliminar.id_producto);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: 'Producto eliminado exitosamente.', tipo: 'exito' });
      await cargarProductos();
    } catch (err) {
      console.error('Error al eliminar producto:', err.message);
      setToast({ mostrar: true, mensaje: 'Error al eliminar el producto.', tipo: 'error' });
    }
  };

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
      return;
    }

    const textoLower = textoBusqueda.toLowerCase().trim();
    const filtradas = productos.filter((prod) =>
      prod.nombre_producto.toLowerCase().includes(textoLower) ||
      (prod.descripcion && prod.descripcion.toLowerCase().includes(textoLower))
    );

    setProductosFiltrados(filtradas);
  }, [textoBusqueda, productos]);

  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda]);

  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_producto: producto.id_producto,
      nombreProducto: producto.nombre_producto,
      descripcion: producto.descripcion || '',
      precio: producto.precio ?? '',
      imagen: producto.imagen || '',
      id_categoria: producto.categoria_producto || '',
    });
    setArchivoImagenEditar(null);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return (
    <Container>
      <br />
      <Row className="align-items-center mb-3">
        <Col xs={9}>
          <h3><i className="bi-bag-fill me-2"></i> Productos</h3>
        </Col>
        <Col xs={3} className="text-end">
          <Button onClick={() => setMostrarModal(true)}>
            <i className="bi-plus-lg"></i> <span className="d-none d-sm-inline">Nuevo</span>
          </Button>
        </Col>
      </Row>
      <hr />

      <CuadroBusquedas textoBusqueda={textoBusqueda} manejarCambioBusqueda={manejarBusqueda} />

      {textoBusqueda.trim() !== '' && productosFiltrados.length === 0 && (
        <Alert variant="warning" className="mt-3">
          No se encontraron productos que coincidan con la búsqueda.
        </Alert>
      )}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejarCambioArchivo={manejarCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
        archivoImagen={archivoImagen}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejarCambioArchivoEdicion={manejarCambioArchivoEdicion}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
        archivoImagenEditar={archivoImagenEditar}
      />

      <ModalEliminacionProducto
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
              productos={productosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              categorias={categorias}
            />
          </div>

          <div className="d-none d-lg-block">
            <TablaProductos
              productos={productosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              categorias={categorias}
            />
          </div>

          {productos.length === 0 && <p className="text-center">No hay datos.</p>}
        </>
      )}

      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={productosFiltrados.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />
    </Container>
  );
};

export default Productos;
