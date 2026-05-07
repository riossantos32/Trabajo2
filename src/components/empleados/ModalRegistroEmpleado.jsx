import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ModalRegistroEmpleado = ({
  mostrarModal,
  setMostrarModal,
  nuevoEmpleado,
  manejoCambioInput,
  agregarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    try {
      await agregarEmpleado();
    } finally {
      setDeshabilitado(false);
    }
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Empleado</Modal.Title>
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
                  value={nuevoEmpleado.nombre || ""}
                  onChange={manejoCambioInput}
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
                  value={nuevoEmpleado.apellido || ""}
                  onChange={manejoCambioInput}
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
                  value={nuevoEmpleado.pin_acceso || ""}
                  onChange={manejoCambioInput}
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
                  value={nuevoEmpleado.tipo_empleado || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej. Administrador, Vendedor"
                  required
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

export default ModalRegistroEmpleado;
