import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  categorias,
  manejarCambioInputEdicion,
  manejoCambioArchivoEdicion,
  actualizarProducto,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    try {
      await actualizarProducto();
    } finally {
      setDeshabilitado(false);
    }
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={productoEditar.nombreProducto}
              onChange={manejarCambioInputEdicion}
              placeholder="Ingresa el nombre del producto"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={productoEditar.descripcion}
              onChange={manejarCambioInputEdicion}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria_producto"
              value={productoEditar.categoria_producto}
              onChange={manejarCambioInputEdicion}
            >
              <option value="">Seleccione una categoría</option>
              {categorias?.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={productoEditar.precio}
              onChange={manejarCambioInputEdicion}
              placeholder="Ingresa el precio"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar imagen</Form.Label>
            <Form.Control
              type="file"
              name="imagen"
              accept="image/*"
              onChange={manejoCambioArchivoEdicion}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>O URL de imagen</Form.Label>
            <Form.Control
              type="text"
              name="imagen"
              value={productoEditar.imagen}
              onChange={manejarCambioInputEdicion}
              placeholder="Ingresa URL o selecciona un archivo"
            />
          </Form.Group>
          {productoEditar.imagen && (
            <div className="text-center mb-3">
              <img
                src={productoEditar.imagen}
                alt="Vista previa"
                style={{ maxWidth: "100%", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={
            deshabilitado ||
            !productoEditar.nombreProducto?.trim() ||
            !productoEditar.descripcion?.trim() ||
            !productoEditar.categoria_producto?.toString().trim() ||
            !productoEditar.precio?.toString().trim() ||
            !productoEditar.imagen?.trim()
          }
        >
          {deshabilitado ? 'Guardando...' : 'Actualizar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;