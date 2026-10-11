import React from "react";
import { Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Icono from "../Icono";

const FormularioLogin = ({
  usuario,
  contrasena,
  error,
  setUsuario,
  setContrasena,
  iniciarSesion,
  cargando
}) => {
  return (
    <section className="login-glass-panel" aria-labelledby="login-title">
      <aside className="login-showcase">
        <div className="login-brand-lockup">
          <span className="login-brand-icon"><Icono nombre="farmacia" size={23} /></span>
          <span><strong>Dassy<span>Data</span></strong><small>FARMACIA DASSY</small></span>
        </div>
        <div className="login-showcase-copy">
          <span className="login-overline">GESTIÓN DE FARMACIA</span>
          <h1>Tu día,<br /><em>en orden.</em></h1>
          <p>Un espacio claro para cada operación de Farmacia Dassy.</p>
        </div>
        <div className="login-showcase-foot"><span className="login-status-dot" />Acceso seguro</div>
      </aside>

      <div className="login-content">
        <header className="login-content-heading">
          <span className="login-overline">BIENVENIDO DE NUEVO</span>
          <h2 id="login-title">Iniciar sesión</h2>
          <p>Ingresa tus datos para continuar.</p>
        </header>

        {error && <Alert variant="danger" className="login-error" role="alert">{error}</Alert>}

        <Form className="login-form" onSubmit={(evento) => { evento.preventDefault(); iniciarSesion(); }}>
          <Form.Group className="login-field" controlId="usuario">
            <Form.Label>Correo electrónico</Form.Label>
            <div className="login-input-shell">
              <Icono nombre="usuario" size={17} />
              <Form.Control
                type="email"
                placeholder="nombre@correo.com"
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>
          </Form.Group>

          <Form.Group className="login-field" controlId="contrasena">
            <Form.Label>Contraseña</Form.Label>
            <div className="login-input-shell">
              <Icono nombre="clave" size={17} />
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </Form.Group>

          <button className="primary-button login-submit" type="submit" disabled={cargando}>
            <span>{cargando ? <><i className="login-spinner" />Iniciando sesión...</> : "Iniciar sesión"}</span>
            {!cargando && <Icono nombre="flecha" size={17} />}
          </button>
        </Form>

        <footer className="login-footer">
          <p>¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
          <Link to="/catalogo" className="login-catalog-link"><Icono nombre="flechaAtras" size={15} />Ver catálogo público</Link>
        </footer>
      </div>
    </section>
  );
};

export default FormularioLogin;
