import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaCompras = ({
  compras,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarCompra
}) => {
  return (
    <Table striped borderless hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>Proveedor</th>
          <th>Fecha Compra</th>
          <th>N° Factura</th>
          <th>Total Compra</th>
          <th>Estado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {compras.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-4 text-muted">
              No hay compras registradas para mostrar.
            </td>
          </tr>
        ) : (
          compras.map((c) => {
            const estadoColor =
              c.estado === "recibido" ? "success" : c.estado === "cancelado" ? "danger" : "warning";

            return (
              <tr key={c.id}>
                <td><strong>{c.proveedores?.nombre || "Sin proveedor"}</strong></td>
                <td>
                  {c.fecha_compra ? new Date(c.fecha_compra).toLocaleDateString() : "—"}
                </td>
                <td>{c.numero_factura_proveedor || "—"}</td>
                <td>
                  <strong>C${Number(c.total_compra || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}</strong>
                </td>
                <td>
                  <Badge bg={estadoColor} className="text-capitalize">
                    {c.estado || "solicitado"}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(c)}
                    title="Editar compra"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEliminacion(c)}
                    title="Eliminar compra"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  {copiarCompra && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="m-1"
                      onClick={() => copiarCompra(c)}
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

export default TablaCompras;
