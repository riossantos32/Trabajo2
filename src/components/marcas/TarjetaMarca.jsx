import React from "react";
import { Card, Button, Col, Row } from "react-bootstrap";

const TarjetaMarca = ({
  marcas,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarMarca
}) => {
  if (marcas.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay marcas disponibles para mostrar.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-3">
      {marcas.map((marca) => (
        <Col key={marca.id}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                  style={{ width: "38px", height: "38px", backgroundColor: "#2e8bcf" }}
                >
                  <i className="bi bi-tag-fill"></i>
                </div>
                <div>
                  <Card.Title className="mb-0 fs-6">{marca.nombre}</Card.Title>
                  <small className="text-muted">ID: {marca.id?.slice?.(0, 8) || marca.id}</small>
                </div>
              </div>

              <div className="mt-auto pt-2 d-flex justify-content-end gap-1 border-top">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => abrirModalEdicion(marca)}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(marca)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>
                {copiarMarca && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => copiarMarca(marca)}
                    title="Copiar"
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetaMarca;
