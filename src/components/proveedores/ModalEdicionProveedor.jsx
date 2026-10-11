import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionProveedor = ({
  mostrarModal,
  setMostrarModal,
  proveedorEditar,
  manejoCambioInputEdicion,
  actualizarProveedor
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title><i className="bi bi-pencil-square me-2"></i>Editar Proveedor</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => { e.preventDefault(); actualizarProveedor(); }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre / Razón Social</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={proveedorEditar.nombre || ""}
              onChange={manejoCambioInputEdicion}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Persona de Contacto</Form.Label>
            <Form.Control
              type="text"
              name="contacto"
              value={proveedorEditar.contacto || ""}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={proveedorEditar.telefono || ""}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="direccion"
              value={proveedorEditar.direccion || ""}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" type="submit">
            Actualizar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEdicionProveedor;
