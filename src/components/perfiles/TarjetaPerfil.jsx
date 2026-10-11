import React from "react";
import { Card, Button, Col, Row, Badge } from "react-bootstrap";

const TarjetaPerfil = ({
  perfiles,
  abrirModalEdicion,
  copiarPerfil
}) => {
  if (perfiles.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay perfiles de usuario disponibles.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-3">
      {perfiles.map((p) => {
        const esPropietario = p.rol === "propietario";

        return (
          <Col key={p.id_usuario}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white me-2 fs-5 fw-bold"
                    style={{ width: "42px", height: "42px", backgroundColor: esPropietario ? "#1068db" : "#6c757d" }}
                  >
                    {p.nombre_completo ? p.nombre_completo.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <Card.Title className="mb-0 fs-6">{p.nombre_completo || "Usuario"}</Card.Title>
                    <small className="text-muted">{p.correo}</small>
                  </div>
                </div>

                <div className="mb-3">
                  <Badge bg={esPropietario ? "primary" : "secondary"} className="text-capitalize">
                    {p.rol || "cliente"}
                  </Badge>
                  {p.created_at && (
                    <small className="text-muted d-block mt-2">
                      Registrado: {new Date(p.created_at).toLocaleDateString()}
                    </small>
                  )}
                </div>

                <div className="mt-auto pt-2 d-flex justify-content-end gap-1 border-top">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => abrirModalEdicion(p)}
                    title="Editar rol"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  {copiarPerfil && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => copiarPerfil(p)}
                      title="Copiar"
                    >
                      <i className="bi bi-clipboard"></i>
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default TarjetaPerfil;
