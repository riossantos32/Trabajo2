import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from '../components/NotificacionOperacion';
import ModalRegistroCliente from '../components/clientes/ModalRegistroCliente';
import ModalEdicionCliente from '../components/clientes/ModalEdicionCliente';
import ModalEliminacionCliente from '../components/clientes/ModalEliminacionCliente';
import TablaClientes from '../components/clientes/TablaClientes';
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Clientes = () => {
    // --- ESTADOS DE DATOS ---
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    
    // --- ESTADOS DE MODALES Y UI ---
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteEditar, setClienteEditar] = useState({
        id_cliente: "",
        nombre: "",
        apellido: "",
        celular: ""
    });
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: "",
        apellido: "",
        celular: ""
    });
    const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
    
    // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establecerPaginaActual] = useState(1);

    // ================== CARGAR DATOS ==================
    const cargarClientes = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("clientes")
                .select("*")
                .order("id_cliente", { ascending: false });

            if (error) throw error;
            setClientes(data || []);
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al cargar clientes", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    // ================== FILTRADO Y PAGINACIÓN ==================
    useEffect(() => {
        const filtrados = clientes.filter((cli) =>
            cli.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
            cli.apellido.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
            cli.celular.toLowerCase().includes(textoBusqueda.toLowerCase())
        );
        setClientesFiltrados(filtrados);
        establecerPaginaActual(1);
    }, [textoBusqueda, clientes]);

    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = clientesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

    // ================== CRUD ACCIONES ==================
    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevoCliente((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setClienteEditar((prev) => ({ ...prev, [name]: value }));
    };

    const agregarCliente = async () => {
        try {
            if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.celular) {
                setToast({ mostrar: true, mensaje: "Completa todos los campos obligatorios.", tipo: "advertencia" });
                return;
            }

            const { error } = await supabase.from("clientes").insert([
                {
                    nombre: nuevoCliente.nombre.trim(),
                    apellido: nuevoCliente.apellido.trim(),
                    celular: nuevoCliente.celular.trim(),
                },
            ]);

            if (error) throw error;

            setToast({ mostrar: true, mensaje: "Cliente registrado correctamente.", tipo: "exito" });
            setNuevoCliente({ nombre: "", apellido: "", celular: "" });
            setMostrarModalRegistro(false);
            await cargarClientes();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al registrar el cliente.", tipo: "error" });
        }
    };

    const actualizarCliente = async () => {
        try {
            if (!clienteEditar.nombre || !clienteEditar.apellido || !clienteEditar.celular) {
                setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes.", tipo: "advertencia" });
                return;
            }

            const { error } = await supabase
                .from("clientes")
                .update({
                    nombre: clienteEditar.nombre,
                    apellido: clienteEditar.apellido,
                    celular: clienteEditar.celular,
                })
                .eq("id_cliente", clienteEditar.id_cliente);

            if (error) throw error;

            setMostrarModalEdicion(false);
            setToast({ mostrar: true, mensaje: "Cliente actualizado.", tipo: "exito" });
            await cargarClientes();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al actualizar.", tipo: "error" });
        }
    };

    const eliminarCliente = async () => {
        try {
            const { error } = await supabase.from("clientes").delete().eq("id_cliente", clienteAEliminar.id_cliente);
            if (error) throw error;
            setMostrarModalEliminacion(false);
            setToast({ mostrar: true, mensaje: "Cliente eliminado.", tipo: "exito" });
            await cargarClientes();
        } catch (err) {
            setToast({ mostrar: true, mensaje: "Error al eliminar.", tipo: "error" });
        }
    };

    const abrirModalEdicion = (cliente) => {
        setClienteEditar(cliente);
        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (cliente) => {
        setClienteAEliminar(cliente);
        setMostrarModalEliminacion(true);
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 className="text-primary"><i className="bi bi-person-badge-fill me-2"></i>Gestión de Clientes</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setMostrarModalRegistro(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Nuevo Cliente
                    </Button>
                </Col>
            </Row>

            <CuadroBusquedas 
                textoBusqueda={textoBusqueda} 
                manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)} 
                placeholder="Buscar por nombre, apellido o celular..."
            />

            {cargando ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando clientes...</p>
                </div>
            ) : (
                <>
                    {clientesFiltrados.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            No se encontraron clientes.
                        </Alert>
                    ) : (
                        <>
                            <TablaClientes 
                                clientes={registrosActuales} 
                                abrirModalEdicion={abrirModalEdicion} 
                                abrirModalEliminacion={abrirModalEliminacion} 
                            />
                            <Paginacion 
                                registrosPorPagina={registrosPorPagina} 
                                totalRegistros={clientesFiltrados.length} 
                                paginaActual={paginaActual} 
                                establecerPaginaActual={establecerPaginaActual} 
                                establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                            />
                        </>
                    )}
                </>
            )}

            <ModalRegistroCliente 
                mostrarModal={mostrarModalRegistro} 
                setMostrarModal={setMostrarModalRegistro} 
                nuevoCliente={nuevoCliente} 
                manejoCambioInput={manejoCambioInput} 
                agregarCliente={agregarCliente} 
            />

            <ModalEdicionCliente 
                mostrarModalEdicion={mostrarModalEdicion} 
                setMostrarModalEdicion={setMostrarModalEdicion} 
                clienteEditar={clienteEditar} 
                manejarCambioInputEdicion={manejoCambioInputEdicion} 
                actualizarCliente={actualizarCliente} 
            />

            <ModalEliminacionCliente 
                mostrarModalEliminacion={mostrarModalEliminacion} 
                setMostrarModalEliminacion={setMostrarModalEliminacion} 
                eliminarCliente={eliminarCliente} 
                cliente={clienteAEliminar} 
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

export default Clientes;
