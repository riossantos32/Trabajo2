import React from 'react';
import { Form, Image } from 'react-bootstrap';

const FormularioRegistroProducto = ({ producto, onInputChange, onFileChange, categorias }) => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del producto</Form.Label>
        <Form.Control
          type="text"
          name="nombreProducto"
          value={producto.nombreProducto}
          onChange={onInputChange}
          placeholder="Ingresa el nombre del producto"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Categoría</Form.Label>
        <Form.Select
          name="id_categoria"
          value={producto.id_categoria || ''}
          onChange={onInputChange}
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
          value={producto.descripcion}
          onChange={onInputChange}
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
          value={producto.precio}
          onChange={onInputChange}
          placeholder="Ingresa el precio"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Imagen</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
      </Form.Group>

      {producto.imagen && typeof producto.imagen === 'string' && producto.imagen.includes('http') && (
        <div className="mb-3">
          <Image src={producto.imagen} alt="Imagen actual" thumbnail fluid />
        </div>
      )}
    </Form>
  );
};

export default FormularioRegistroProducto;
