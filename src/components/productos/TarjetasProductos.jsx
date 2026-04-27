import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

const TarjetasProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion, categorias }) => {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(!(productos && productos.length > 0));
  }, [productos]);

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias?.find((cat) => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre_categoria : 'Sin categoría';
  };

  if (cargando) {
    return <p className="text-center">Cargando productos...</p>;
  }

  if (!productos || productos.length === 0) {
    return <p className="text-center">No hay productos para mostrar.</p>;
  }

  return (
    <Row xs={1} md={2} xl={3} className="g-3">
      {productos.map((producto) => (
        <Col key={producto.id_producto}>
          <Card className="h-100 shadow-sm">
            {producto.imagen ? (
              <Card.Img
                variant="top"
                src={producto.imagen}
                alt={producto.nombre_producto}
                style={{ height: '200px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                <span className="text-muted">Sin imagen</span>
              </div>
            )}
            <Card.Body>
              <Card.Title>{producto.nombre_producto}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {obtenerNombreCategoria(producto.categoria_producto)}
              </Card.Subtitle>
              <Card.Text>{producto.descripcion}</Card.Text>
              <Card.Text>
                <strong>Precio:</strong> ${producto.precio?.toFixed ? producto.precio.toFixed(2) : producto.precio}
              </Card.Text>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => abrirModalEdicion(producto)}>
                Editar
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminacion(producto)}>
                Eliminar
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetasProductos;
