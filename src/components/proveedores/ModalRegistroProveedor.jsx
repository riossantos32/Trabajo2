import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalRegistroProveedor = ({
  mostrarModal,
  setMostrarModal,
  nuevoProveedor,
  manejoCambioInput,
  guardarProveedor
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><i className="bi bi-truck me-2"></i>Registrar Proveedor</Modal.Title>
      </Modal.Header>
      <Form onSubmit={guardarProveedor}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre / Razón Social</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoProveedor.nombre || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. Distribuidora Farmacéutica S.A."
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Persona de Contacto</Form.Label>
            <Form.Control
              type="text"
              name="contacto"
              value={nuevoProveedor.contacto || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. Juan Pérez"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={nuevoProveedor.telefono || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. +505 8888 8888"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="direccion"
              value={nuevoProveedor.direccion || ""}
              onChange={manejoCambioInput}
              placeholder="Dirección fiscal o de almacén"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Proveedor
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRegistroProveedor;
