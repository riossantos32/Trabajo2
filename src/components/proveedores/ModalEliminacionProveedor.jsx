import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionProveedor = ({
  mostrarModal,
  setMostrarModal,
  proveedorAEliminar,
  confirmarEliminacion
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><i className="bi bi-exclamation-triangle me-2"></i>Eliminar Proveedor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Está seguro de que desea eliminar el proveedor <strong>{proveedorAEliminar?.nombre}</strong>?</p>
        <p className="text-muted small mb-0">Esta acción no se puede deshacer.</p>
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

export default ModalEliminacionProveedor;
