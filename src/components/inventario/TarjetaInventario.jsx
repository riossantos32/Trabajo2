import React from "react";
import { Card, Button, Col, Row, Badge } from "react-bootstrap";

const TarjetaInventario = ({
  inventario,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarInventario
}) => {
  if (inventario.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay registros de inventario disponibles para mostrar.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-3">
      {inventario.map((item) => {
        const stockBajo = Number(item.cantidad_disponible || 0) <= 5;
        const nombreProducto = item.productos?.nombre_comercial || item.productos?.nombre_producto || "Producto";

        return (
          <Col key={item.id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Title className="mb-0 fs-6">{nombreProducto}</Card.Title>
                    {item.productos?.codigo_barra && (
                      <small className="text-muted">Cód: {item.productos.codigo_barra}</small>
                    )}
                  </div>
                  <Badge bg={stockBajo ? "danger" : "success"} className="fs-6">
                    {item.cantidad_disponible ?? 0} unid.
                  </Badge>
                </div>

                <div className="small text-muted mb-3 mt-2">
                  <div>
                    <i className="bi bi-cash me-1 text-success"></i>
                    Costo promedio: <strong>C${Number(item.costo_unitario_promedio || 0).toFixed(2)}</strong>
                  </div>
                  <div>
                    <i className="bi bi-calendar-event me-1 text-primary"></i>
                    Vence: {item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : "Sin fecha"}
                  </div>
                  <div>
                    <i className="bi bi-geo-alt me-1 text-secondary"></i>
                    Estante: {item.ubicacion_estante || "No asignado"}
                  </div>
                </div>

                <div className="mt-auto pt-2 d-flex justify-content-end gap-1 border-top">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => abrirModalEdicion(item)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(item)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  {copiarInventario && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => copiarInventario(item)}
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

export default TarjetaInventario;
