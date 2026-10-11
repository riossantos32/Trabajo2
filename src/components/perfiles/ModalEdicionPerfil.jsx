import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionPerfil = ({
  mostrarModal,
  setMostrarModal,
  perfilEditar,
  manejoCambioInputEdicion,
  actualizarPerfil
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title><i className="bi bi-person-gear me-2"></i>Actualizar Perfil de Usuario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => { e.preventDefault(); actualizarPerfil(); }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="nombre_completo"
              value={perfilEditar.nombre_completo || ""}
              onChange={manejoCambioInputEdicion}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              value={perfilEditar.correo || ""}
              disabled
              readOnly
            />
            <Form.Text className="text-muted">El correo está vinculado a la cuenta de autenticación.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol del Usuario</Form.Label>
            <Form.Select
              name="rol"
              value={perfilEditar.rol || "cliente"}
              onChange={manejoCambioInputEdicion}
              required
            >
              <option value="cliente">Cliente (Acceso a Catálogo y Compras)</option>
              <option value="propietario">Propietario / Administrador (Acceso Completo)</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEdicionPerfil;
