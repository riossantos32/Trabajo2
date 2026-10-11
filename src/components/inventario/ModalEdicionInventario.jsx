import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionInventario = ({
  mostrarModal,
  setMostrarModal,
  inventarioEditar,
  manejoCambioInputEdicion,
  actualizarInventario,
  productos
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title><i className="bi bi-pencil-square me-2"></i>Actualizar Inventario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => { e.preventDefault(); actualizarInventario(); }}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Select
              name="producto_id"
              value={inventarioEditar.producto_id || ""}
              onChange={manejoCambioInputEdicion}
              required
            >
              <option value="">-- Selecciona un producto --</option>
              {productos.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nombre_comercial || prod.nombre_producto}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cantidad Disponible</Form.Label>
            <Form.Control
              type="number"
              name="cantidad_disponible"
              value={inventarioEditar.cantidad_disponible ?? ""}
              onChange={manejoCambioInputEdicion}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Costo Unitario Promedio (C$)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="costo_unitario_promedio"
              value={inventarioEditar.costo_unitario_promedio ?? ""}
              onChange={manejoCambioInputEdicion}
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Vencimiento</Form.Label>
            <Form.Control
              type="date"
              name="fecha_vencimiento"
              value={inventarioEditar.fecha_vencimiento ? inventarioEditar.fecha_vencimiento.slice(0, 10) : ""}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubicación / Estante</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion_estante"
              value={inventarioEditar.ubicacion_estante || ""}
              onChange={manejoCambioInputEdicion}
            />
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

export default ModalEdicionInventario;
