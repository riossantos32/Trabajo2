import React, { useState, useEffect } from "react";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from '../components/NotificacionOperacion';
import ModalRegistroProducto from '../components/productos/ModalRegistroProducto';
import ModalEdicionProducto from '../components/productos/ModalEdicionProducto';
import ModalEliminacionProducto from '../components/productos/ModalEliminacionProducto';
import ModalQRProducto from '../components/productos/ModalQRProducto';

import TarjetasProductos from '../components/productos/TarjetasProductos';
import TablaProductos from '../components/productos/TablaProductos';  
import Paginacion from "../components/ordenamiento/Paginacion";

import { useAuth } from "../context/AuthContext";
import Icono from "../components/Icono";
import "./Productos.css";

const Productos = () => {
    const { tienePermiso } = useAuth();
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
    const [mostrarModalQR, setMostrarModalQR] = useState(false);
    const [productoQR, setProductoQR] = useState(null);
    const [productoEditar, setProductoEditar] = useState({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null
    });
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    
    // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: '',
        descripcion_producto: '',
        precio_venta: '',
        categoria_producto: '',
        archivo: null, 
    });

    // Mapeo unificado para compatibilidad entre esquemas
    const mapProducto = (p) => ({
        ...p,
        id_producto: p.id_producto || p.id,
        nombre_producto: p.nombre_producto || p.nombre_comercial || "Sin nombre",
        descripcion_producto: p.descripcion_producto || p.descripcion || [p.nombre_generico, p.concentracion, p.presentacion].filter(Boolean).join(" · ") || "",
        precio_venta: p.precio_venta != null ? Number(p.precio_venta) : Number(p.precio_venta_sugerido || 0),
        url_imagen: p.url_imagen || p.imagen_url || "",
        categoria_producto: p.categoria_producto || p.categoria_id || "",
    });

    // ================== CARGAR DATOS ==================
    const cargarProductos = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("productos")
                .select("*");

            if (error) throw error;
            const mapeados = (data || []).map(mapProducto);
            setProductos(mapeados);
        } catch (err) {
            setToast({ mostrar: true, mensaje: `Error al cargar productos: ${err.message}`, tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from("categorias")
                .select("*");
            if (error) throw error;
            const norm = (data || []).map((c) => ({
                ...c,
                id_categoria: c.id_categoria || c.id,
                nombre_categoria: c.nombre_categoria || c.nombre || "Categoría",
            }));
            setCategorias(norm);
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
            if (!nuevoProducto.nombre_producto || !nuevoProducto.categoria_producto || !nuevoProducto.precio_venta || !nuevoProducto.archivo) {
                setToast({ mostrar: true, mensaje: "Completa los campos obligatorios e incluye una imagen.", tipo: "advertencia" });
                return;
            }

            let urlPublica = await subirImagenStorage(nuevoProducto.archivo);

            // Intentar esquema Dassydata primero
            const payloadDassy = {
                nombre_comercial: nuevoProducto.nombre_producto.trim(),
                descripcion: nuevoProducto.descripcion_producto || null,
                precio_venta_sugerido: parseFloat(nuevoProducto.precio_venta),
                categoria_id: nuevoProducto.categoria_producto,
                imagen_url: urlPublica,
            };

            let { error } = await supabase.from("productos").insert([payloadDassy]);
            if (error) {
                // Si falla, intentar esquema tradicional
                const payloadTrad = {
                    nombre_producto: nuevoProducto.nombre_producto.trim(),
                    descripcion_producto: nuevoProducto.descripcion_producto || null,
                    categoria_producto: parseInt(nuevoProducto.categoria_producto) || null,
                    precio_venta: parseFloat(nuevoProducto.precio_venta),
                    url_imagen: urlPublica,
                };
                const res = await supabase.from("productos").insert([payloadTrad]);
                error = res.error;
            }

            if (error) throw error;

            setToast({ mostrar: true, mensaje: "Producto registrado correctamente.", tipo: "exito" });
            setNuevoProducto({ nombre_producto: "", descripcion_producto: "", categoria_producto: "", precio_venta: "", archivo: null });
            setMostrarModalRegistro(false);
            await cargarProductos();
        } catch (err) {
            console.error("Error al registrar:", err);
            setToast({ mostrar: true, mensaje: `Error al registrar el producto: ${err.message}`, tipo: "error" });
        }
    };

    const actualizarProducto = async () => {
        try {
            if (!productoEditar.nombre_producto || !productoEditar.categoria_producto || !productoEditar.precio_venta) {
                setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes.", tipo: "advertencia" });
                return;
            }

            let urlImagenFinal = productoEditar.url_imagen;

            if (productoEditar.archivo) {
                urlImagenFinal = await subirImagenStorage(productoEditar.archivo);
            }

            const id = productoEditar.id_producto || productoEditar.id;

            // Intentar esquema Dassydata
            let { error } = await supabase
                .from("productos")
                .update({
                    nombre_comercial: productoEditar.nombre_producto,
                    descripcion: productoEditar.descripcion_producto,
                    categoria_id: productoEditar.categoria_producto,
                    precio_venta_sugerido: parseFloat(productoEditar.precio_venta),
                    imagen_url: urlImagenFinal,
                })
                .eq("id", id);

            if (error) {
                const res = await supabase
                    .from("productos")
                    .update({
                        nombre_producto: productoEditar.nombre_producto,
                        descripcion_producto: productoEditar.descripcion_producto,
                        categoria_producto: parseInt(productoEditar.categoria_producto) || null,
                        precio_venta: parseFloat(productoEditar.precio_venta),
                        url_imagen: urlImagenFinal,
                    })
                    .eq("id_producto", id);
                error = res.error;
            }

            if (error) throw error;

            setMostrarModalEdicion(false);
            setToast({ mostrar: true, mensaje: "Producto actualizado.", tipo: "exito" });
            await cargarProductos();
        } catch (err) {
            console.error("Error al actualizar:", err);
            setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
        }
    };

    const eliminarProducto = async () => {
        try {
            const id = productoAEliminar.id_producto || productoAEliminar.id;
            let { error } = await supabase.from("productos").delete().eq("id", id);
            if (error) {
                const res = await supabase.from("productos").delete().eq("id_producto", id);
                error = res.error;
            }
            if (error) throw error;
            setMostrarModalEliminacion(false);
            setToast({ mostrar: true, mensaje: "Producto eliminado.", tipo: "exito" });
            await cargarProductos();
        } catch (err) {
            setToast({ mostrar: true, mensaje: `Error al eliminar: ${err.message}`, tipo: "error" });
        }
    };

    const generarQRImagen = (producto) => {
  if (!producto?.url_imagen) {
    setToast({
      mostrar: true,
      mensaje: "Este producto no tiene imagen asociada",
      tipo: "advertencia"
    });
    return;
  }

  setProductoQR(producto);
  setMostrarModalQR(true);
};

    // ================== EFECTOS Y FILTROS ==================
    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    useEffect(() => {
        const busqueda = textoBusqueda.toLowerCase().trim();
        const filtrados = productos.filter((p) => (
            (p.nombre_producto && p.nombre_producto.toLowerCase().includes(busqueda)) ||
            (p.categorias && p.categorias.nombre_categoria && p.categorias.nombre_categoria.toLowerCase().includes(busqueda))
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
            archivo: null
        });
        setMostrarModalEdicion(true);
    };

    return (
        <div className="admin-page products-admin-page">
            <header className="admin-heading products-heading">
                <div>
                    <span className="eyebrow">CATÁLOGO · INVENTARIO</span>
                    <h1><Icono nombre="producto" size={25} />Productos<span className="heading-dot">.</span></h1>
                    <p>Administra el catálogo, los precios y las imágenes de tus productos.</p>
                </div>
                <div>
                    {tienePermiso('crear_productos') && (
                        <button className="primary-button products-create-button" type="button" onClick={() => setMostrarModalRegistro(true)}>
                            <Icono nombre="mas" size={17} />
                            Nuevo producto
                        </button>
                    )}
                </div>
            </header>

            <section className="products-toolbar" aria-label="Búsqueda de productos">
                <p className="products-results"><strong>{productosFiltrados.length}</strong><span>{productosFiltrados.length === 1 ? 'producto' : 'productos'}</span></p>
                <label className="products-search">
                    <Icono nombre="buscar" size={16} />
                    <input
                        type="search"
                        value={textoBusqueda}
                        onChange={(evento) => setTextoBusqueda(evento.target.value)}
                        placeholder="Buscar por nombre o categoría"
                        aria-label="Buscar productos por nombre o categoría"
                    />
                    {textoBusqueda && <button type="button" onClick={() => setTextoBusqueda("")} aria-label="Limpiar búsqueda"><Icono nombre="cerrar" size={14} /></button>}
                </label>
            </section>

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
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarProducto={eliminarProducto}
                producto={productoAEliminar}
            />

            <ModalQRProducto
  mostrar={mostrarModalQR}
  onHide={() => setMostrarModalQR(false)}
  producto={productoQR}
/>

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

            {cargando ? (
                <div className="products-loading"><span className="products-spinner" /><span>Cargando productos...</span></div>
            ) : (
                <>
                    <div className="d-lg-none">
                        <TarjetasProductos 
                            productos={productosPaginados} 
                            categorias={categorias}
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={(p) => { setProductoAEliminar(p); setMostrarModalEliminacion(true); }}
                            abrirModalDescuento={(p) => { setProductoSeleccionadoDescuento(p); setMostrarModalDescuento(true); }}
                            generarQRImagen={generarQRImagen}
                            //copiarProducto={copiarProducto}
                        />
                    </div>
                    <div className="d-none d-lg-block">
                        <TablaProductos 
                            productos={productosPaginados} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={(p) => { setProductoAEliminar(p); setMostrarModalEliminacion(true); }}
                            abrirModalDescuento={(p) => { setProductoSeleccionadoDescuento(p); setMostrarModalDescuento(true); }}
                            generarQRImagen={generarQRImagen}
                            //copiarProducto={copiarProducto}
                            
                        />
                    </div>
                </>
            )}

            {!cargando && <div className="products-pagination">
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={productosFiltrados.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={establecerPaginaActual}
                    establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                />
            </div>}
        </div>
    );
};

export default Productos;