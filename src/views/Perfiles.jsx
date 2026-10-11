import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Icono from "../components/Icono";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaPerfiles from "../components/perfiles/TablaPerfiles";
import TarjetaPerfil from "../components/perfiles/TarjetaPerfil";
import ModalEdicionPerfil from "../components/perfiles/ModalEdicionPerfil";
import { useTema } from "../context/Tema";
import { useAuth } from "../context/AuthContext";

const Perfiles = () => {
  const { tema, setTema } = useTema();
  const { usuario } = useAuth();
  const [perfiles, setPerfiles] = useState([]);
  const [perfilesFiltrados, setPerfilesFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  // Modales
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [perfilEditar, setPerfilEditar] = useState({ id_usuario: "", nombre_completo: "", correo: "", rol: "cliente" });

  // Notificaciones, búsqueda y paginación
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const cargarPerfiles = useCallback(async () => {
    if (usuario?.rol === "cliente") {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .order("nombre_completo", { ascending: true });

      if (error) throw error;
      setPerfiles(data || []);
      setPerfilesFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al cargar perfiles: ${err.message}`, tipo: "error" });
    } finally {
      setCargando(false);
    }
  }, [usuario?.rol]);

  useEffect(() => {
    cargarPerfiles();
  }, [cargarPerfiles]);

  useEffect(() => {
    const q = textoBusqueda.toLowerCase().trim();
    if (!q) {
      setPerfilesFiltrados(perfiles);
    } else {
      setPerfilesFiltrados(
        perfiles.filter((p) => {
          const nom = p.nombre_completo || "";
          const cor = p.correo || "";
          const rol = p.rol || "";
          return nom.toLowerCase().includes(q) || cor.toLowerCase().includes(q) || rol.toLowerCase().includes(q);
        })
      );
    }
    establecerPaginaActual(1);
  }, [textoBusqueda, perfiles]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const perfilesPaginados = perfilesFiltrados.slice(indicePrimero, indiceUltimo);

  const preferenciaApariencia = (
    <section className="appearance-preference" aria-labelledby="appearance-title">
      <span className="appearance-icon"><Icono nombre="sol" size={18} /></span>
      <div className="appearance-copy">
        <strong id="appearance-title">Apariencia</strong>
        <small>Personaliza el tema de la aplicación</small>
      </div>
      <div className="appearance-switch" role="group" aria-label="Tema de la aplicación">
        <button type="button" className={tema === "dia" ? "active" : ""} aria-pressed={tema === "dia"} onClick={() => setTema("dia")}>
          <Icono nombre="sol" size={15} />Día
        </button>
        <button type="button" className={tema === "noche" ? "active" : ""} aria-pressed={tema === "noche"} onClick={() => setTema("noche")}>
          <Icono nombre="luna" size={15} />Noche
        </button>
      </div>
    </section>
  );

  const manejoCambioInputEdicion = (e) => {
    setPerfilEditar({ ...perfilEditar, [e.target.name]: e.target.value });
  };

  const actualizarPerfil = async () => {
    if (!perfilEditar.id_usuario) return;

    try {
      const { error } = await supabase
        .from("perfiles")
        .update({
          nombre_completo: perfilEditar.nombre_completo,
          rol: perfilEditar.rol
        })
        .eq("id_usuario", perfilEditar.id_usuario);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Perfil de usuario actualizado con éxito.", tipo: "exito" });
      cargarPerfiles();
    } catch (err) {
      setToast({ mostrar: true, mensaje: `Error al actualizar: ${err.message}`, tipo: "error" });
    }
  };

  const copiarPerfil = (p) => {
    navigator.clipboard.writeText(`Usuario: ${p.nombre_completo} | Correo: ${p.correo} | Rol: ${p.rol}`);
    setToast({ mostrar: true, mensaje: "Datos copiados al portapapeles.", tipo: "exito" });
  };

  if (usuario?.rol === "cliente") {
    return (
      <Container className="mt-4 mb-5 client-profile-page">
        <header className="client-profile-heading">
          <span className="client-profile-avatar"><Icono nombre="usuario" size={23} /></span>
          <div>
            <span className="client-profile-eyebrow">CUENTA DE CLIENTE</span>
            <h1>Mi perfil</h1>
            <p>{usuario.nombre}</p>
          </div>
        </header>
        <section className="client-profile-summary" aria-label="Datos de la cuenta">
          <Icono nombre="correo" size={17} />
          <span>{usuario.email}</span>
          <strong>Cliente</strong>
        </section>
        {preferenciaApariencia}
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6}>
          <h2 className="mb-1 text-primary">
            <Icono nombre="usuarios" size={21} className="me-2" />Gestión de Perfiles y Usuarios
          </h2>
          <p className="text-muted mb-0">Control de roles y accesos a Farmacia Dassy</p>
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0 d-flex justify-content-md-end gap-2">
          <Button
            variant={vistaTabla ? "outline-primary" : "primary"}
            onClick={() => setVistaTabla(!vistaTabla)}
            title={vistaTabla ? "Ver como tarjetas" : "Ver como tabla"}
          >
            <Icono nombre={vistaTabla ? "cuadricula" : "tabla"} size={17} />
          </Button>
        </Col>
      </Row>

      {preferenciaApariencia}

      <Row className="mb-3">
        <Col xs={12} md={8}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar usuario por nombre, correo o rol..."
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0 text-muted">
          <span>Total usuarios: <strong>{perfilesFiltrados.length}</strong></span>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando perfiles de usuario...</p>
        </div>
      ) : vistaTabla ? (
        <TablaPerfiles
          perfiles={perfilesPaginados}
          abrirModalEdicion={(p) => { setPerfilEditar(p); setMostrarModalEdicion(true); }}
          copiarPerfil={copiarPerfil}
        />
      ) : (
        <TarjetaPerfil
          perfiles={perfilesPaginados}
          abrirModalEdicion={(p) => { setPerfilEditar(p); setMostrarModalEdicion(true); }}
          copiarPerfil={copiarPerfil}
        />
      )}

      {perfilesFiltrados.length > registrosPorPagina && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Paginacion
              totalRegistros={perfilesFiltrados.length}
              registrosPorPagina={registrosPorPagina}
              paginaActual={paginaActual}
              establecerPaginaActual={establecerPaginaActual}
              establecerRegistrosPorPagina={establecerRegistrosPorPagina}
            />
          </Col>
        </Row>
      )}

      {/* Modal Edición */}
      <ModalEdicionPerfil
        mostrarModal={mostrarModalEdicion}
        setMostrarModal={setMostrarModalEdicion}
        perfilEditar={perfilEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarPerfil={actualizarPerfil}
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

export default Perfiles;
