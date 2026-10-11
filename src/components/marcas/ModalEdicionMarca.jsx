import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionMarca = ({
  mostrarModal,
  setMostrarModal,
  marcaEditar,
  manejoCambioInputEdicion,
  actualizarMarca
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title><i className="bi bi-pencil-square me-2"></i>Editar Marca</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => { e.preventDefault(); actualizarMarca(); }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Marca</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={marcaEditar.nombre || ""}
              onChange={manejoCambioInputEdicion}
              required
              autoFocus
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

export default ModalEdicionMarca;
