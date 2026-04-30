import React from 'react';
import { Table, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TablaProductos = ({ productos = [], abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th>Precio</th>
          <th className="d-none d-md-table-cell">Imagen</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id_producto}>
            <td>{producto.id_producto}</td>
            
            <td>{producto.nombreProducto || 'Sin nombre'}</td>
            
            <td className="d-none d-md-table-cell">
              {producto.descripcion || 'Sin descripción'}
            </td>
            
            <td>
              ${parseFloat(producto.precio_venta || 0).toFixed(2)}
            </td>
            
            <td className="d-none d-md-table-cell text-center">
              {producto.url_imagen ? (
                <img
                  src={producto.url_imagen}
                  alt={producto.nombre_producto}
                  style={{ 
                    height: '48px', 
                    width: 'auto', 
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <span className="text-muted">Sin imagen</span>
              )}
            </td>
            
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(producto)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEliminacion(producto)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;