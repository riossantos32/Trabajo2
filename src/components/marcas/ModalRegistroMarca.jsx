import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalRegistroMarca = ({
  mostrarModal,
  setMostrarModal,
  nuevaMarca,
  manejoCambioInput,
  guardarMarca
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><i className="bi bi-tag me-2"></i>Registrar Nueva Marca</Modal.Title>
      </Modal.Header>
      <Form onSubmit={guardarMarca}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Marca</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevaMarca.nombre || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. Pfizer, Bayer, Genfar..."
              required
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Marca
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRegistroMarca;
