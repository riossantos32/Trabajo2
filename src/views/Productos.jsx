import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from '../components/NotificacionOperacion';
import ModalRegistroProducto from '../components/productos/ModalRegistroProducto';
import ModalEdicionProducto from '../components/productos/ModalEdicionProducto';
import ModalEliminacionProducto from '../components/productos/ModalEliminacionProducto';

import TarjetasProductos from '../components/productos/TarjetasProductos';
import TablaProductos from '../components/productos/TablaProductos';  
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Productos = () => {
    // --- ESTADOS DE DATOS ---
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    
    // --- ESTADOS DE MODALES Y UI ---
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [mostrarModalDescuento, setMostrarModalDescuento] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [productoSeleccionadoDescuento, setProductoSeleccionadoDescuento] = useState(null);
    const [productoEditar, setProductoEditar] = useState({
        id_producto: "",
        nombre_producto: "",
        descripcion: "",
        categoria_id: "",
        precio_venta: "",
        precio_compra: "",
        url_imagenes: "",
        archivo: null,
        id_estado: "2"
    });
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    
    // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: '',
        descripcion: '',
        precio_venta: '',
        precio_compra: '',
        categoria_id: '',
        archivo: null, 

    });

    // ================== CARGAR DATOS ==================
    const cargarProductos = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("productos")
                .select(`*, categorias (nombre_categoria)`)
                .order("id_producto", { ascending: false });

            if (error) throw error;
            setProductos(data || []);
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al cargar productos", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("nombre_categoria");
            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error categorías:", err.message);
        }
    };

    // ================== LOGICA DE NEGOCIO Y ARCHIVOS ==================
    
    // Manejo de archivos (Storage en lugar de Base64)
    const manejoCambioArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setNuevoProducto((prev) => ({ ...prev, archivo }));
        } else {
            setToast({ mostrar: true, mensaje: "Selecciona una imagen válida.", tipo: "advertencia" });
        }
    };

    const manejoCambioArchivoEdicion = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setProductoEditar((prev) => ({ ...prev, archivo }));
        } else {
            setToast({ mostrar: true, mensaje: "Selecciona una imagen válida.", tipo: "advertencia" });
        }
    };

    const subirImagenStorage = async (archivo) => {
        const nombreArchivo = `${Date.now()}_${archivo.name}`;
        const { error: uploadError } = await supabase.storage
            .from("imagenes_productos")
            .upload(nombreArchivo, archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from("imagenes_productos")
            .getPublicUrl(nombreArchivo);
        
        return urlData.publicUrl;
    };

    // ================== CRUD ACCIONES ==================

    const agregarProducto = async () => {
        try {
            if (!nuevoProducto.nombre_producto || !nuevoProducto.categoria_id || !nuevoProducto.precio_venta || !nuevoProducto.archivo) {
                setToast({ mostrar: true, mensaje: "Completa los campos obligatorios e incluye una imagen.", tipo: "advertencia" });
                return;
            }

            let urlPublica = await subirImagenStorage(nuevoProducto.archivo);

            const { error } = await supabase.from("productos").insert([
                {
                    nombre_producto: nuevoProducto.nombre_producto.trim(),
                    descripcion: nuevoProducto.descripcion || null,
                    categoria_id: parseInt(nuevoProducto.categoria_id),
                    precio_venta: parseFloat(nuevoProducto.precio_venta),
                    precio_compra: parseFloat(nuevoProducto.precio_compra),
                    url_imagenes: [urlPublica],
                },
            ]);

            if (error) throw error;

            setToast({ mostrar: true, mensaje: "Producto registrado correctamente.", tipo: "exito" });
            setNuevoProducto({ nombre_producto: "", descripcion: "", categoria_id: "", precio_venta: "", precio_compra: "", archivo: null, id_estado: "2" });
            setMostrarModalRegistro(false);
            await cargarProductos();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al registrar el producto.", tipo: "error" });
        }
    };

    const actualizarProducto = async () => {
        try {
            if (!productoEditar.nombre_producto || !productoEditar.categoria_id || !productoEditar.precio_venta) {
                setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes.", tipo: "advertencia" });
                return;
            }

            let urlImagenFinal = Array.isArray(productoEditar.url_imagenes) ? productoEditar.url_imagenes[0] : productoEditar.url_imagenes;

            if (productoEditar.archivo) {
                urlImagenFinal = await subirImagenStorage(productoEditar.archivo);
                // Opcional: Aquí podrías añadir la lógica de la vista 1 para eliminar la imagen anterior del storage
            }

            const { error } = await supabase
                .from("productos")
                .update({
                    nombre_producto: productoEditar.nombre_producto,
                    descripcion: productoEditar.descripcion,
                    categoria_id: parseInt(productoEditar.categoria_id),
                    precio_venta: parseFloat(productoEditar.precio_venta),
                    precio_compra: parseFloat(productoEditar.precio_compra),
                    url_imagenes: [urlImagenFinal],
                })
                .eq("id_producto", productoEditar.id_producto);

            if (error) throw error;

            setMostrarModalEdicion(false);
            setToast({ mostrar: true, mensaje: "Producto actualizado.", tipo: "exito" });
            await cargarProductos();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al actualizar.", tipo: "error" });
        }
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

    // ================== EFECTOS Y FILTROS ==================
    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    useEffect(() => {
        const busqueda = textoBusqueda.toLowerCase().trim();
        const filtrados = productos.filter((p) => (
            p.nombre_producto?.toLowerCase().includes(busqueda) ||
            p.categorias?.nombre_categoria?.toLowerCase().includes(busqueda)
        ));
        setProductosFiltrados(filtrados);
        establecerPaginaActual(1);
    }, [textoBusqueda, productos]);

    const productosPaginados = productosFiltrados.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina
    );

    // ================== MANEJADORES UI ==================
    const abrirModalEdicion = (producto) => {
        setProductoEditar({
            ...producto,
            archivo: null,
            id_estado: producto.id_estado?.toString() || '2'
        });
        setMostrarModalEdicion(true);
    };

    return (
        <Container className="mt-5">
            <Row className="align-items-center mb-3">
                <Col xs={9}>
                    <h3><i className="bi bi-box-seam me-2"></i> Gestión de Productos</h3>
                </Col>
                <Col xs={3} className="text-end">
                    <Button onClick={() => setMostrarModalRegistro(true)}>
                        <i className="bi bi-plus-lg"></i> <span className="d-none d-sm-inline ms-2">Nuevo</span>
                    </Button>
                </Col>
            </Row>
            <hr />

            <CuadroBusquedas 
                textoBusqueda={textoBusqueda} 
                manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)} 
            />

            <ModalRegistroProducto
                mostrarModal={mostrarModalRegistro}
                setMostrarModal={setMostrarModalRegistro}
                nuevoProducto={nuevoProducto}
                categorias={categorias}
                manejoCambioInput={(e) => setNuevoProducto({...nuevoProducto, [e.target.name]: e.target.value})}
                manejoCambioArchivo={manejoCambioArchivo}
                agregarProducto={agregarProducto}
            />

            <ModalEdicionProducto
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                productoEditar={productoEditar}
                categorias={categorias}
                manejarCambioInputEdicion={(e) => setProductoEditar({...productoEditar, [e.target.name]: e.target.value})}
                manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
                actualizarProducto={actualizarProducto}
            />

            <ModalEliminacionProducto
                mostrarModal={mostrarModalEliminacion}
                setMostrarModal={setMostrarModalEliminacion}
                productoAEliminar={productoAEliminar}
                eliminarProducto={eliminarProducto}
            />

            

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

            {cargando ? (
                <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>
            ) : (
                <>
                    <div className="d-lg-none">
                        <TarjetasProductos 
                            productos={productosPaginados} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={(p) => { setProductoAEliminar(p); setMostrarModalEliminacion(true); }}
                            abrirModalDescuento={(p) => { setProductoSeleccionadoDescuento(p); setMostrarModalDescuento(true); }}
                        />
                    </div>
                    <div className="d-none d-lg-block">
                        <TablaProductos 
                            productos={productosPaginados} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={(p) => { setProductoAEliminar(p); setMostrarModalEliminacion(true); }}
                            abrirModalDescuento={(p) => { setProductoSeleccionadoDescuento(p); setMostrarModalDescuento(true); }}
                        />
                    </div>
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