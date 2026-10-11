import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import Icono from "../components/Icono";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  const { registrar } = useAuth();
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setAviso("");
    setCargando(true);

    try {
      const data = await registrar({ nombre: nombre.trim(), email: email.trim(), password });
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        setAviso("Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta.");
      }
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="register-screen">
      <Card className="register-glass-panel">
        <Card.Body>
          <div className="text-center mb-4">
            <div className="register-brand-icon">
              <Icono nombre="farmacia" size={23} />
            </div>
            <h3 className="fw-bold mb-0 text-dark">
              Crear Cuenta
            </h3>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "1px" }}>
              FARMACIA DASSY · CLIENTE
            </small>
          </div>

          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          {aviso && <Alert variant="success" className="py-2 small">{aviso}</Alert>}

          <Form onSubmit={manejarEnvio}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </Form.Group>

            <Button
              variant="success"
              className="w-100 py-2 fw-semibold shadow-sm"
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Registrando..." : "Crear Cuenta"}
            </Button>

            <div className="text-center mt-3 pt-2 border-top">
              <p className="small text-muted mb-1">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                  Inicia sesión
                </Link>
              </p>
              <Link to="/catalogo" className="small text-secondary text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i>Ver catálogo público
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Registro;