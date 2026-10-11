import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCompra = ({
  mostrarModal,
  setMostrarModal,
  compraAEliminar,
  confirmarEliminacion
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title><i className="bi bi-exclamation-triangle me-2"></i>Eliminar Registro de Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          ¿Está seguro de que desea eliminar la compra a{" "}
          <strong>{compraAEliminar?.proveedores?.nombre || "este proveedor"}</strong> por{" "}
          <strong>C${Number(compraAEliminar?.total_compra || 0).toFixed(2)}</strong>?
        </p>
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

export default ModalEliminacionCompra;
