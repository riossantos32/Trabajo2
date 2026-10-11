import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionInventario = ({
  mostrarModal,
  setMostrarModal,
  inventarioAEliminar,
  confirmarEliminacion
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><i className="bi bi-exclamation-triangle me-2"></i>Eliminar Registro de Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          ¿Está seguro de que desea eliminar el registro de inventario de{" "}
          <strong>{inventarioAEliminar?.productos?.nombre_comercial || "este producto"}</strong>?
        </p>
        <p className="text-muted small mb-0">Esta acción descontará el stock configurado en el sistema.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirmarEliminacion}>
          Eliminar Definitivamente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionInventario;
