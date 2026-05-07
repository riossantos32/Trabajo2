import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalEliminacionEmpleado = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarEmpleado,
  empleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarEmpleado();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Empleado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          ¿Está seguro que desea eliminar al empleado <strong>{empleado?.nombre} {empleado?.apellido}</strong>?
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleEliminar} disabled={deshabilitado}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionEmpleado;
