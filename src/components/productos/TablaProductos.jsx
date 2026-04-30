import React from 'react';
import { Table, Button, Image } from 'react-bootstrap';

const TablaProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion, categorias }) => {
  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias?.find((cat) => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre_categoria : 'Sin categoría';
  };

  const obtenerImagenProducto = (producto) =>
    producto.imagen || producto.url_imagen || producto.imagen_producto || producto.foto || producto.foto_producto || '';

  if (!productos || productos.length === 0) {
    return null;
  }

  return (
    <Table striped bordered hover responsive className="shadow-sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th className="d-none d-sm-table-cell">Categoría</th>
          <th>Precio</th>
          <th className="d-none d-sm-table-cell">Imagen</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id_producto}>
            <td>{producto.id_producto}</td>
            <td>{producto.nombre_producto}</td>
            <td className="d-none d-md-table-cell">{producto.descripcion}</td>
            <td className="d-none d-sm-table-cell">
              {obtenerNombreCategoria(producto.id_categoria || producto.categoria_producto || producto.nombre_categoria)}
            </td>
            <td>${producto.precio?.toFixed ? producto.precio.toFixed(2) : producto.precio}</td>
            <td className="d-none d-sm-table-cell" style={{ width: '120px' }}>
              {obtenerImagenProducto(producto) ? (
                <Image src={obtenerImagenProducto(producto)} alt={producto.nombre_producto} thumbnail fluid />
              ) : (
                <span className="text-muted">Sin imagen</span>
              )}
            </td>
            <td className="text-nowrap">
              <Button variant="outline-primary" size="sm" onClick={() => abrirModalEdicion(producto)}>
                Editar
              </Button>{' '}
              <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminacion(producto)}>
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;
