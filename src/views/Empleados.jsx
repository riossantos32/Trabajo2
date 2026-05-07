import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from '../components/NotificacionOperacion';
import ModalRegistroEmpleado from '../components/empleados/ModalRegistroEmpleado';
import ModalEdicionEmpleado from '../components/empleados/ModalEdicionEmpleado';
import ModalEliminacionEmpleado from '../components/empleados/ModalEliminacionEmpleado';
import TablaEmpleados from '../components/empleados/TablaEmpleados';
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Empleados = () => {
    // --- ESTADOS DE DATOS ---
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
    
    // --- ESTADOS DE MODALES Y UI ---
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
    const [empleadoEditar, setEmpleadoEditar] = useState({
        id_empleado: "",
        nombre: "",
        apellido: "",
        pin_acceso: "",
        tipo_empleado: ""
    });
    const [nuevoEmpleado, setNuevoEmpleado] = useState({
        nombre: "",
        apellido: "",
        pin_acceso: "",
        tipo_empleado: ""
    });
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    
    // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    // ================== CARGAR DATOS ==================
    const cargarEmpleados = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("empleados")
                .select("*")
                .order("id_empleado", { ascending: false });

            if (error) throw error;
            setEmpleados(data || []);
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al cargar empleados", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    // ================== FILTRADO Y PAGINACIÓN ==================
    useEffect(() => {
        const filtrados = empleados.filter((emp) =>
            emp.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
            emp.apellido.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
            emp.tipo_empleado.toLowerCase().includes(textoBusqueda.toLowerCase())
        );
        setEmpleadosFiltrados(filtrados);
        establecerPaginaActual(1);
    }, [textoBusqueda, empleados]);

    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = empleadosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

    // ================== CRUD ACCIONES ==================
    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevoEmpleado((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setEmpleadoEditar((prev) => ({ ...prev, [name]: value }));
    };

    const agregarEmpleado = async () => {
        try {
            if (!nuevoEmpleado.nombre || !nuevoEmpleado.apellido || !nuevoEmpleado.pin_acceso || !nuevoEmpleado.tipo_empleado) {
                setToast({ mostrar: true, mensaje: "Completa todos los campos obligatorios.", tipo: "advertencia" });
                return;
            }

            const { error } = await supabase.from("empleados").insert([
                {
                    nombre: nuevoEmpleado.nombre.trim(),
                    apellido: nuevoEmpleado.apellido.trim(),
                    pin_acceso: nuevoEmpleado.pin_acceso,
                    tipo_empleado: nuevoEmpleado.tipo_empleado.trim(),
                },
            ]);

            if (error) throw error;

            setToast({ mostrar: true, mensaje: "Empleado registrado correctamente.", tipo: "exito" });
            setNuevoEmpleado({ nombre: "", apellido: "", pin_acceso: "", tipo_empleado: "" });
            setMostrarModalRegistro(false);
            await cargarEmpleados();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al registrar el empleado.", tipo: "error" });
        }
    };

    const actualizarEmpleado = async () => {
        try {
            if (!empleadoEditar.nombre || !empleadoEditar.apellido || !empleadoEditar.pin_acceso || !empleadoEditar.tipo_empleado) {
                setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes.", tipo: "advertencia" });
                return;
            }

            const { error } = await supabase
                .from("empleados")
                .update({
                    nombre: empleadoEditar.nombre,
                    apellido: empleadoEditar.apellido,
                    pin_acceso: empleadoEditar.pin_acceso,
                    tipo_empleado: empleadoEditar.tipo_empleado,
                })
                .eq("id_empleado", empleadoEditar.id_empleado);

            if (error) throw error;

            setMostrarModalEdicion(false);
            setToast({ mostrar: true, mensaje: "Empleado actualizado.", tipo: "exito" });
            await cargarEmpleados();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al actualizar.", tipo: "error" });
        }
    };

    const eliminarEmpleado = async () => {
        try {
            const { error } = await supabase.from("empleados").delete().eq("id_empleado", empleadoAEliminar.id_empleado);
            if (error) throw error;
            setMostrarModalEliminacion(false);
            setToast({ mostrar: true, mensaje: "Empleado eliminado.", tipo: "exito" });
            await cargarEmpleados();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al eliminar.", tipo: "error" });
        }
    };

    const abrirModalEdicion = (empleado) => {
        setEmpleadoEditar(empleado);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (empleado) => {
        setEmpleadoAEliminar(empleado);
        setMostrarModalEliminacion(true);
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 className="text-primary"><i className="bi bi-people-fill me-2"></i>Gestión de Empleados</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setMostrarModalRegistro(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Nuevo Empleado
                    </Button>
                </Col>
            </Row>

            <CuadroBusquedas 
                textoBusqueda={textoBusqueda} 
                manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)} 
                placeholder="Buscar por nombre, apellido o tipo..."
            />

            {cargando ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando empleados...</p>
                </div>
            ) : (
                <>
                    {empleadosFiltrados.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            No se encontraron empleados.
                        </Alert>
                    ) : (
                        <>
                            <TablaEmpleados 
                                empleados={registrosActuales} 
                                abrirModalEdicion={abrirModalEdicion} 
                                abrirModalEliminacion={abrirModalEliminacion} 
                            />
                            <Paginacion 
                                registrosPorPagina={registrosPorPagina} 
                                totalRegistros={empleadosFiltrados.length} 
                                paginaActual={paginaActual} 
                                establecerPaginaActual={establecerPaginaActual} 
                                establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                            />
                        </>
                    )}
                </>
            )}

            <ModalRegistroEmpleado 
                mostrarModal={mostrarModalRegistro} 
                setMostrarModal={setMostrarModalRegistro} 
                nuevoEmpleado={nuevoEmpleado} 
                manejoCambioInput={manejoCambioInput} 
                agregarEmpleado={agregarEmpleado} 
            />

            <ModalEdicionEmpleado 
                mostrarModalEdicion={mostrarModalEdicion} 
                setMostrarModalEdicion={setMostrarModalEdicion} 
                empleadoEditar={empleadoEditar} 
                manejarCambioInputEdicion={manejoCambioInputEdicion} 
                actualizarEmpleado={actualizarEmpleado} 
            />

            <ModalEliminacionEmpleado 
                mostrarModalEliminacion={mostrarModalEliminacion} 
                setMostrarModalEliminacion={setMostrarModalEliminacion} 
                eliminarEmpleado={eliminarEmpleado} 
                empleado={empleadoAEliminar} 
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

export default Empleados;
