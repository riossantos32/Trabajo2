import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionCompra = ({
  mostrarModal,
  setMostrarModal,
  compraEditar,
  manejoCambioInputEdicion,
  actualizarCompra,
  proveedores
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title><i className="bi bi-pencil-square me-2"></i>Actualizar Compra</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => { e.preventDefault(); actualizarCompra(); }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Proveedor</Form.Label>
            <Form.Select
              name="proveedor_id"
              value={compraEditar.proveedor_id || ""}
              onChange={manejoCambioInputEdicion}
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
              value={compraEditar.fecha_compra ? compraEditar.fecha_compra.slice(0, 10) : ""}
              onChange={manejoCambioInputEdicion}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>N° de Factura del Proveedor</Form.Label>
            <Form.Control
              type="text"
              name="numero_factura_proveedor"
              value={compraEditar.numero_factura_proveedor || ""}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total de la Compra (C$)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="total_compra"
              value={compraEditar.total_compra ?? ""}
              onChange={manejoCambioInputEdicion}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado de la Compra</Form.Label>
            <Form.Select
              name="estado"
              value={compraEditar.estado || "solicitado"}
              onChange={manejoCambioInputEdicion}
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
          <Button variant="warning" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEdicionCompra;
