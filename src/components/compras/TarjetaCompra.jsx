import React from "react";
import { Card, Button, Col, Row, Badge } from "react-bootstrap";

const TarjetaCompra = ({
  compras,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarCompra
}) => {
  if (compras.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay compras registradas para mostrar.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-3">
      {compras.map((c) => {
        const estadoColor =
          c.estado === "recibido" ? "success" : c.estado === "cancelado" ? "danger" : "warning";

        return (
          <Col key={c.id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Title className="mb-0 fs-6">
                      {c.proveedores?.nombre || "Proveedor"}
                    </Card.Title>
                    <small className="text-muted">Factura: {c.numero_factura_proveedor || "Sin factura"}</small>
                  </div>
                  <Badge bg={estadoColor} className="text-capitalize">
                    {c.estado || "solicitado"}
                  </Badge>
                </div>

                <div className="small text-muted my-2">
                  <div>
                    <i className="bi bi-calendar3 me-1 text-primary"></i>
                    Fecha: {c.fecha_compra ? new Date(c.fecha_compra).toLocaleDateString() : "Sin fecha"}
                  </div>
                  <div className="fs-5 text-dark fw-bold mt-1">
                    C${Number(c.total_compra || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="mt-auto pt-2 d-flex justify-content-end gap-1 border-top">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => abrirModalEdicion(c)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(c)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  {copiarCompra && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => copiarCompra(c)}
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

export default TarjetaCompra;
