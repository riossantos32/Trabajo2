import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalEliminacionProducto = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarProducto,
  producto,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarProducto();
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
        <Modal.Title>Eliminar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          ¿Está seguro que desea eliminar el producto <strong>{producto?.nombre_producto || producto?.nombreProducto}</strong>?
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

export default ModalEliminacionProducto;
