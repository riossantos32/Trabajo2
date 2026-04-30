import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

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
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={nuevoProducto.nombreProducto}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre del producto"
            />
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
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria_producto"
              value={nuevoProducto.categoria_producto}
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
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={nuevoProducto.precio}
              onChange={manejoCambioInput}
              placeholder="Ingresa el precio"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Seleccionar imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={manejoCambioArchivo}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>O URL de imagen</Form.Label>
            <Form.Control
              type="text"
              name="imagen"
              value={nuevoProducto.imagen}
              onChange={manejoCambioInput}
              placeholder="O pega la URL de la imagen"
            />
          </Form.Group>

          {nuevoProducto.imagen && (
            <div className="text-center mb-3">
              <img
                src={nuevoProducto.imagen}
                alt="Vista previa"
                style={{ maxWidth: "100%", maxHeight: "180px", objectFit: "cover" }}
              />
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
            !nuevoProducto.nombreProducto?.trim() ||
            !nuevoProducto.descripcion?.trim() ||
            !nuevoProducto.categoria_producto?.toString().trim() ||
            !nuevoProducto.precio?.toString().trim() ||
            !nuevoProducto.imagen?.trim()
          }
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroProducto;