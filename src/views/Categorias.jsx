import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import TablaCategorias from "../components/categorias/TablaCategorias";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from '../components/NotificacionOperacion';
import ModalRegistroCategoria from '../components/categorias/ModalRegistroCategoria';
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminarCategoria from "../components/categorias/ModalEliminacionCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import ModalEnvioCorreoCategorias from "../components/categorias/ModalEnvioCorreoCategorias";
import emailjs from '@emailjs/browser';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuth } from "../context/AuthContext";

const Categorias = () => {
    const { tienePermiso } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
const [paginaActual, establecerPaginaActual] = useState(1);
const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
const [emailDestino, setEmailDestino] = useState("");
const [enviandoCorreo, setEnviandoCorreo] = useState(false);

    const [categoriaEditar, setCategoriaEditar] = useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: '',
        descripcion_categoria: ''
    });

    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria(prev => ({ ...prev, [name]: value }));
    };

    const manejarBusqueda = (e) => {
  setTextoBusqueda(e.target.value);
};

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar(prev => ({ ...prev, [name]: value }));
    };

    // --- FUNCIÓN ACTUALIZAR (Corregida) ---
   const actualizarCategoria = async () => {
  try {
    if (
      !categoriaEditar.nombre_categoria.trim() ||
      !categoriaEditar.descripcion_categoria.trim()
    ) {
      setToast({
        mostrar: true,
        mensaje: "Debe llenar todos los campos.",
        tipo: "advertencia",
      });
      return;
    }

    setMostrarModalEdicion(false);

    const { error } = await supabase
      .from("categorias")
      .update({
        nombre_categoria: categoriaEditar.nombre_categoria,
        descripcion_categoria: categoriaEditar.descripcion_categoria,
      })
      .eq("id_categoria", categoriaEditar.id_categoria);

    if (error) {
      console.error("Error al actualizar categoría:", error.message);
      setToast({
        mostrar: true,
        mensaje: `Error al actualizar la categoría ${categoriaEditar.nombre_categoria}.`,
        tipo: "error",
      });
      return;
    }

    await cargarCategorias();

    setToast({
      mostrar: true,
      mensaje: `Categoría ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
      tipo: "exito",
    });

  } catch (err) {
    setToast({
      mostrar: true,
      mensaje: "Error inesperado al actualizar categoría.",
      tipo: "error",
    });
    console.error("Excepción al actualizar categoría:", err.message);
  }
};

const categoriasPaginadas = categoriasFiltradas.slice(
  (paginaActual - 1) * registrosPorPagina,
  paginaActual * registrosPorPagina
);


const eliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    try {
        setMostrarModalEliminacion(false);
        const { error } = await supabase
            .from("categorias")
            .delete()
            .eq("id_categoria", categoriaAEliminar.id_categoria);

        if (error) {
            console.error("Error al eliminar categoría:", error.message);
            setToast({
                 mostrar: true, 
                 mensaje: "Error al eliminar la categoría.", 
                 tipo: "error" 
        });
            return; 
        }

        await cargarCategorias();

        setToast({ mostrar: true, 
            mensaje: `Categoría ${categoriaAEliminar.nombre_categoria} eliminada exitosamente.`, 
            tipo: "exito" 
        });
    } catch (err) {
        setToast({ mostrar: true, 
            mensaje: "Error al eliminar la categoría.", 
            tipo: "error" });
    }
};
   
    const agregarCategoria = async () => {
        try {
            if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
                setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
                return;
            }

            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: nuevaCategoria.nombre_categoria,
                    descripcion_categoria: nuevaCategoria.descripcion_categoria,
                },
            ]);

            if (error) throw error;

            setToast({ mostrar: true, mensaje: `Categoría registrada exitosamente.`, tipo: "exito" });
            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);
            cargarCategorias(); // Recargar lista
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al registrar.", tipo: "error" });
        }
    };

    const generarPDFCategoria = (categoria) => {

  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("Reporte de Categoría", 14, 20);

  // Línea decorativa
  doc.line(14, 25, 195, 25);

  // Información de la categoría
  doc.setFontSize(12);

  autoTable(doc, {
    startY: 35,
    head: [["Campo", "Valor"]],
    body: [
      ["ID", categoria.id_categoria],
      ["Nombre", categoria.nombre_categoria],
      ["Descripción", categoria.descripcion_categoria],
    ],
  });

  // Descargar PDF
  doc.save(`categoria_${categoria.id_categoria}.pdf`);
};


    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
      cargarCategorias();
    }, []);

    useEffect(() => {
     
  if (!textoBusqueda.trim()) {
    setCategoriasFiltradas(categorias);
  } else {
    const textoLower = textoBusqueda.toLowerCase().trim();
    const filtradas = categorias.filter(
      (cat) =>
        cat.nombre_categoria.toLowerCase().includes(textoLower) ||
        (cat.descripcion_categoria && cat.descripcion_categoria.toLowerCase().includes(textoLower))
    );
    setCategoriasFiltradas(filtradas);
  }
}, [textoBusqueda, categorias]);

    useEffect(() => {
        establecerPaginaActual(1);
    }, [textoBusqueda]);

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar(categoria);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    // Inicializar EmailJS con la llave pública
useEffect(() => {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
}, []);

const abrirModalCorreo = () => {
  setEmailDestino("");
  setMostrarModalCorreo(true);
};

const formatearCategoriasParaCorreo = () => {
  if (categorias.length === 0) return "No hay categorías registradas.";
  let texto = `LISTADO DE CATEGORÍAS\n\n`;
  texto += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
  texto += `Total de categorías: ${categorias.length}\n\n`;
  
  categorias.forEach((cat, index) => {
    texto += `${index + 1}. ${cat.nombre_categoria}\n`;
    if (cat.descripcion_categoria) {
      texto += `   Descripción: ${cat.descripcion_categoria}\n`;
    }
    texto += `\n`;
  });
  return texto;
};

const enviarCorreoCategorias = () => {
  if (!emailDestino.trim()) {
    setToast({
      mostrar: true,
      mensaje: "Por favor ingresa un correo destino.",
      tipo: "advertencia",
    });
    return;
  }
  
  setEnviandoCorreo(true);
  const mensaje = formatearCategoriasParaCorreo();
  
  const templateParams = {
    to_name: "Administrador",
    user_email: emailDestino,
    message: mensaje,
    fecha_envio: new Date().toLocaleDateString("es-NI")
  };
  
  emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams
  )
  .then(() => {
    setToast({
      mostrar: true,
      mensaje: "Correo enviado correctamente.",
      tipo: "exito",
    });
    setMostrarModalCorreo(false);
    setEmailDestino("");
  })
  .catch((error) => {
    console.error("Error EmailJS:", error);
    setToast({
      mostrar: true,
      mensaje: "Error al enviar el correo.",
      tipo: "error",
    });
  })
  .finally(() => {
    setEnviandoCorreo(false);
  });
};

    return (
        <Container>
            <br />
            
<Row className="align-items-center mb-3">
  <Col xs={8} sm={8} md={8} lg={8} className="d-flex align-items-center">
    <h3 className="mb-0">
      <i className="bi-bookmark-plus-fill me-2"></i> Categorías
    </h3>
  </Col>
  <Col xs={2} sm={2} md={2} lg={2} className="text-end">
    <Button variant="primary" onClick={abrirModalCorreo} size="md">
      <i className="bi bi-envelope"></i>
      <span className="d-none d-lg-inline ms-2">Enviar por Correo</span>
    </Button>
  </Col>
  <Col xs={2} sm={2} md={2} lg={2} className="text-end">
    <Button
      onClick={() => setMostrarModal(true)}
      size="md"
    >
      <i className="bi-plus-lg"></i>
      <span className="d-none d-lg-inline ms-2">Nueva Categoría</span>
    </Button>
  </Col>
</Row>

            
            <hr />

            <CuadroBusquedas
                textoBusqueda={textoBusqueda}
                manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
            />

            {textoBusqueda.trim() !== '' && categoriasFiltradas.length === 0 && (
                <Alert variant="warning" className="mt-3">
                    No se encontraron categorías que coincidan con la búsqueda.
                </Alert>
            )}

            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

          
            <ModalEdicionCategoria 
                mostrarModalEdicion={mostrarModalEdicion} 
                setMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejarCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            /> 

            <ModalEliminarCategoria
                mostrarModalEdicion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarCategoria={eliminarCategoria}
                categoria={categoriaAEliminar}
            />

            <ModalEnvioCorreoCategorias
  mostrarModalCorreo={mostrarModalCorreo}
  setMostrarModalCorreo={setMostrarModalCorreo}
  emailDestino={emailDestino}
  setEmailDestino={setEmailDestino}
  enviandoCorreo={enviandoCorreo}
  enviarCorreoCategorias={enviarCorreoCategorias}
  totalCategorias={categorias.length}
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
                    {/* Vista Móvil */}
                    <div className="d-lg-none">
                        <TarjetaCategoria
                            categorias={categoriasPaginadas}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            tienePermiso={tienePermiso}
                        />
                    </div>

                    {/* Vista Escritorio */}
                    <div className="d-none d-lg-block">
                       <TablaCategorias
  categorias={categoriasPaginadas}
  abrirModalEdicion={abrirModalEdicion}
  abrirModalEliminacion={abrirModalEliminacion}
  generarPDFCategoria={generarPDFCategoria}
/>
                    </div>

                    {categorias.length === 0 && <p className="text-center">No hay datos.</p>}
                </>
            )}

            <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={categoriasFiltradas.length}
                paginaActual={paginaActual}
                establecerPaginaActual={establecerPaginaActual}
                establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
        </Container>
    );
};

export default Categorias;