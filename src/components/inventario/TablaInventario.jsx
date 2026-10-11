import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaInventario = ({
  inventario,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarInventario
}) => {
  return (
    <Table striped borderless hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>Producto</th>
          <th>Stock Disponible</th>
          <th>Costo Unit. Promedio</th>
          <th>Vencimiento</th>
          <th>Ubicación Estante</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {inventario.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-4 text-muted">
              No hay registros de inventario para mostrar.
            </td>
          </tr>
        ) : (
          inventario.map((item) => {
            const stockBajo = Number(item.cantidad_disponible || 0) <= 5;
            return (
              <tr key={item.id}>
                <td>
                  <strong>{item.productos?.nombre_comercial || item.productos?.nombre_producto || "Producto"}</strong>
                  {item.productos?.codigo_barra && (
                    <small className="text-muted d-block">Cód: {item.productos.codigo_barra}</small>
                  )}
                </td>
                <td>
                  <Badge bg={stockBajo ? "danger" : "success"} className="fs-6">
                    {item.cantidad_disponible ?? 0}
                  </Badge>
                </td>
                <td>
                  {item.costo_unitario_promedio != null
                    ? `C$${Number(item.costo_unitario_promedio).toFixed(2)}`
                    : "—"}
                </td>
                <td>
                  {item.fecha_vencimiento ? (
                    <span className={new Date(item.fecha_vencimiento) < new Date() ? "text-danger fw-bold" : ""}>
                      {new Date(item.fecha_vencimiento).toLocaleDateString()}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{item.ubicacion_estante || "—"}</td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(item)}
                    title="Editar inventario"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEliminacion(item)}
                    title="Eliminar registro"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  {copiarInventario && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="m-1"
                      onClick={() => copiarInventario(item)}
                      title="Copiar datos"
                    >
                      <i className="bi bi-clipboard"></i>
                    </Button>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
};

export default TablaInventario;
