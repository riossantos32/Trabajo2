import React from 'react';
import Icono from '../Icono';

const TablaProductos = ({ productos = [], abrirModalEdicion, abrirModalEliminacion, generarQRImagen, copiarProducto }) => {
  return (
    <div className="inventory-table-wrap products-table-wrap">
      <table className="inventory-table products-admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Imagen</th>
            <th className="products-actions-heading">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id_producto}>
              <td className="products-name-cell">
                <strong>{producto.nombre_producto || 'Sin nombre'}</strong>
                <small title={producto.id_producto}>ID · {producto.id_producto}</small>
              </td>
              <td className="products-description-cell">{producto.descripcion_producto || 'Sin descripción'}</td>
              <td className="products-price-cell">C$ {parseFloat(producto.precio_venta || 0).toFixed(2)}</td>
              <td className="products-image-cell">
                {producto.url_imagen ? (
                  <img src={producto.url_imagen} alt={producto.nombre_producto} />
                ) : (
                  <span className="products-no-image"><Icono nombre="imagen" size={15} />Sin imagen</span>
                )}
              </td>
              <td>
                <div className="products-row-actions">
                  <button type="button" className="products-row-action products-qr-action" onClick={() => generarQRImagen(producto)} aria-label={`Generar QR de ${producto.nombre_producto}`} title="Generar código QR">
                    <Icono nombre="codigoQr" size={16} />
                  </button>
                  <button type="button" className="products-row-action products-edit-action" onClick={() => abrirModalEdicion(producto)} aria-label={`Editar ${producto.nombre_producto}`} title="Editar producto">
                    <Icono nombre="editar" size={16} />
                  </button>
                  <button type="button" className="products-row-action products-delete-action" onClick={() => abrirModalEliminacion(producto)} aria-label={`Eliminar ${producto.nombre_producto}`} title="Eliminar producto">
                    <Icono nombre="eliminar" size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!productos.length && <tr><td className="table-empty" colSpan={5}>No hay productos que coincidan con la búsqueda.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default TablaProductos;