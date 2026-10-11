import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalRegistroCompra = ({
  mostrarModal,
  setMostrarModal,
  nuevaCompra,
  manejoCambioInput,
  guardarCompra,
  proveedores
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><i className="bi bi-cart-plus me-2"></i>Registrar Compra</Modal.Title>
      </Modal.Header>
      <Form onSubmit={guardarCompra}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Proveedor</Form.Label>
            <Form.Select
              name="proveedor_id"
              value={nuevaCompra.proveedor_id || ""}
              onChange={manejoCambioInput}
              required
            >
              <option value="">-- Selecciona un proveedor --</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Compra</Form.Label>
            <Form.Control
              type="date"
              name="fecha_compra"
              value={nuevaCompra.fecha_compra || ""}
              onChange={manejoCambioInput}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>N° de Factura del Proveedor</Form.Label>
            <Form.Control
              type="text"
              name="numero_factura_proveedor"
              value={nuevaCompra.numero_factura_proveedor || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. FAC-2026-001"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total de la Compra (C$)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="total_compra"
              value={nuevaCompra.total_compra ?? ""}
              onChange={manejoCambioInput}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado de la Compra</Form.Label>
            <Form.Select
              name="estado"
              value={nuevaCompra.estado || "solicitado"}
              onChange={manejoCambioInput}
            >
              <option value="solicitado">Solicitado</option>
              <option value="recibido">Recibido</option>
              <option value="cancelado">Cancelado</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Compra
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRegistroCompra;
