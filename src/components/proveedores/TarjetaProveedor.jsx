import React from "react";
import { Card, Button, Col, Row } from "react-bootstrap";

const TarjetaProveedor = ({
  proveedores,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarProveedor
}) => {
  if (proveedores.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay proveedores disponibles para mostrar.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-3">
      {proveedores.map((p) => (
        <Col key={p.id}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                  style={{ width: "40px", height: "40px", backgroundColor: "#176fae" }}
                >
                  <i className="bi bi-truck fs-5"></i>
                </div>
                <div>
                  <Card.Title className="mb-0 fs-6">{p.nombre}</Card.Title>
                  <small className="text-muted">Contacto: {p.contacto || "General"}</small>
                </div>
              </div>

              <div className="small text-muted mb-3">
                <div><i className="bi bi-telephone me-1 text-primary"></i>{p.telefono || "Sin teléfono"}</div>
                <div><i className="bi bi-geo-alt me-1 text-danger"></i>{p.direccion || "Sin dirección"}</div>
              </div>

              <div className="mt-auto pt-2 d-flex justify-content-end gap-1 border-top">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => abrirModalEdicion(p)}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(p)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>
                {copiarProveedor && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => copiarProveedor(p)}
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

export default TarjetaProveedor;
