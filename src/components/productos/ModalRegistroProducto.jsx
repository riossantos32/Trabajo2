import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'; // Importar Row y Col

const ModalRegistroProducto = ({
  mostrarModal,
  setMostrarModal,
  nuevoProducto,
  categorias,
  manejoCambioInput,
  manejoCambioArchivo,
  agregarProducto,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  // Método para evitar múltiples clics
  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    try {
      await agregarProducto();
    } finally {
      setDeshabilitado(false);
    }
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static" // Evita que se cierre al hacer clic fuera
      centered
      size="lg" // Tamaño recomendado para formularios con descripción[cite: 1]
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {/* Columna para Categoría[cite: 1] */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  name="categoria_producto"
                  value={nuevoProducto.categoria_producto || ""}
                  onChange={manejoCambioInput}
                  required
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Columna para Nombre[cite: 1] */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_producto" // Ajustado según guía[cite: 1]
                  value={nuevoProducto.nombre_producto || ""}
                  onChange={manejoCambioInput}
                  placeholder="Nombre del producto"
                  required
                />
              </Form.Group>
            </Col>

            {/* Fila para Precio[cite: 1] */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Precio de venta *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio_venta"
                  value={nuevoProducto.precio_venta || ""}
                  onChange={manejoCambioInput}
                  placeholder="Precio de venta"
                  required
                />
              </Form.Group>
            </Col>

            {/* Fila para Imagen[cite: 1] */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen del producto *</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivo}
                  required
                />
              </Form.Group>
            </Col>

            {/* Fila para Descripción[cite: 1] */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="descripcion_producto" // Ajustado según guía[cite: 1]
                  value={nuevoProducto.descripcion_producto || ""}
                  onChange={manejoCambioInput}
                  placeholder="Descripción del producto (opcional)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroProducto;