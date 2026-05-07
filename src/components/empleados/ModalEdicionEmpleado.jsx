import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ModalEdicionEmpleado = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  empleadoEditar,
  manejarCambioInputEdicion,
  actualizarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    try {
      await actualizarEmpleado();
    } finally {
      setDeshabilitado(false);
    }
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={empleadoEditar?.nombre || ""}
                  onChange={manejarCambioInputEdicion}
                  placeholder="Nombre"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={empleadoEditar?.apellido || ""}
                  onChange={manejarCambioInputEdicion}
                  placeholder="Apellido"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>PIN de Acceso *</Form.Label>
                <Form.Control
                  type="password"
                  name="pin_acceso"
                  value={empleadoEditar?.pin_acceso || ""}
                  onChange={manejarCambioInputEdicion}
                  placeholder="PIN"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Empleado *</Form.Label>
                <Form.Control
                  type="text"
                  name="tipo_empleado"
                  value={empleadoEditar?.tipo_empleado || ""}
                  onChange={manejarCambioInputEdicion}
                  placeholder="Ej. Administrador, Vendedor"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={deshabilitado}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionEmpleado;
