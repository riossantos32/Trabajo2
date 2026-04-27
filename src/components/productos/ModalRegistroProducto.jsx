import React, { useState } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

const ModalRegistroProducto = ({
  mostrarModal,
  setMostrarModal,
  nuevoProducto,
  manejoCambioInput,
  manejarCambioArchivo,
  agregarProducto,
  categorias,
  archivoImagen,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarProducto();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del producto</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={nuevoProducto.nombreProducto}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre del producto"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="id_categoria"
              value={nuevoProducto.id_categoria || ''}
              onChange={manejoCambioInput}
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
              value={nuevoProducto.descripcion}
              onChange={manejoCambioInput}
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
              value={nuevoProducto.precio}
              onChange={manejoCambioInput}
              placeholder="Ingresa el precio"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={manejarCambioArchivo}
            />
          </Form.Group>

          {nuevoProducto.imagen && typeof nuevoProducto.imagen === 'string' && nuevoProducto.imagen.includes('http') && (
            <div className="mb-3">
              <Image src={nuevoProducto.imagen} alt="Imagen actual" thumbnail fluid />
            </div>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={
            nuevoProducto.nombreProducto.trim() === "" ||
            nuevoProducto.descripcion.trim() === "" ||
            nuevoProducto.precio.toString().trim() === "" ||
            !nuevoProducto.id_categoria ||
            !archivoImagen ||
            deshabilitado
          }
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroProducto;
