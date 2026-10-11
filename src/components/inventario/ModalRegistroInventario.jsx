import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalRegistroInventario = ({
  mostrarModal,
  setMostrarModal,
  nuevoInventario,
  manejoCambioInput,
  guardarInventario,
  productos
}) => {
  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><i className="bi bi-boxes me-2"></i>Registrar en Inventario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={guardarInventario}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar Producto</Form.Label>
            <Form.Select
              name="producto_id"
              value={nuevoInventario.producto_id || ""}
              onChange={manejoCambioInput}
              required
            >
              <option value="">-- Selecciona un producto --</option>
              {productos.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nombre_comercial || prod.nombre_producto} {prod.codigo_barra ? `(${prod.codigo_barra})` : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cantidad Disponible</Form.Label>
            <Form.Control
              type="number"
              name="cantidad_disponible"
              value={nuevoInventario.cantidad_disponible ?? ""}
              onChange={manejoCambioInput}
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
              value={nuevoInventario.costo_unitario_promedio ?? ""}
              onChange={manejoCambioInput}
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Vencimiento</Form.Label>
            <Form.Control
              type="date"
              name="fecha_vencimiento"
              value={nuevoInventario.fecha_vencimiento || ""}
              onChange={manejoCambioInput}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubicación / Estante</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion_estante"
              value={nuevoInventario.ubicacion_estante || ""}
              onChange={manejoCambioInput}
              placeholder="Ej. Estante A-2, Vitrina 1..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar en Inventario
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRegistroInventario;
