import React, { useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';

function TarjetaCatalogo({ producto }) {
  const [mostrarModal, setMostrarModal] = useState(false);

  const imagenProducto = Array.isArray(producto.url_imagenes)
    ? producto.url_imagen[0]
    : producto.url_imagen;

  const descripcionCorta = producto.descripcion?.length > 100
    ? `${producto.descripcion.slice(0, 100)}...`
    : producto.descripcion || 'Sin descripción disponible.';

  const nombreCategoria = producto.categorias?.nombre_categoria || 'Sin categoría';

  return (
    <>
      <Card className="h-100 shadow-sm">
        {imagenProducto ? (
          <Card.Img
            variant="top"
            src={imagenProducto}
            alt={producto.url_imagen}
            style={{ height: '220px', objectFit: 'cover' }}
          />
        ) : (
          <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
            <span className="text-muted">Sin imagen</span>
          </div>
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title>{producto.nombre_producto}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{nombreCategoria}</Card.Subtitle>
          <Card.Text className="flex-grow-1">{descripcionCorta}</Card.Text>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <strong>${producto.precio_venta?.toFixed(2) || '0.00'}</strong>
            <Button variant="primary" size="sm" onClick={() => setMostrarModal(true)}>
              Ver detalles
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{producto.nombre_producto}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imagenProducto ? (
            <img
              src={imagenProducto}
              alt={producto.url_imagen}
              className="img-fluid rounded mb-3"
              style={{ width: '100%', objectFit: 'cover', maxHeight: '320px' }}
            />
          ) : (
            <div className="bg-light d-flex align-items-center justify-content-center rounded mb-3" style={{ height: '220px' }}>
              <span className="text-muted">Sin imagen disponible</span>
            </div>
          )}
          <p className="mb-2"><strong>Categoría:</strong> {nombreCategoria}</p>
          <p className="mb-2"><strong>Precio de venta:</strong> ${producto.precio_venta?.toFixed(2) || '0.00'}</p>
          <p className="mb-2"><strong>Descripción:</strong></p>
          <p className="text-muted">{producto.descripcion_producto || 'Sin descripción disponible.'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TarjetaCatalogo;
