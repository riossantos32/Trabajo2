import React, { useState } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  manejoCambioInputEdicion,
  manejarCambioArchivoEdicion,
  actualizarProducto,
  categorias,
  archivoImagenEditar,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarProducto();
    setDeshabilitado(false);
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
            <Form.Label>Nombre del producto</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={productoEditar.nombreProducto}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el nombre del producto"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="id_categoria"
              value={productoEditar.id_categoria || ''}
              onChange={manejoCambioInputEdicion}
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
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={productoEditar.descripcion}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              name="precio"
              value={productoEditar.precio}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el precio"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={manejarCambioArchivoEdicion}
            />
          </Form.Group>

          {productoEditar.imagen && typeof productoEditar.imagen === 'string' && productoEditar.imagen.includes('http') && (
            <div className="mb-3">
              <Image src={productoEditar.imagen} alt="Imagen actual" thumbnail fluid />
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
            productoEditar.nombreProducto.trim() === "" ||
            productoEditar.descripcion.trim() === "" ||
            productoEditar.precio.toString().trim() === "" ||
            !productoEditar.id_categoria ||
            deshabilitado
          }
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;
