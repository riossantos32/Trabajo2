import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaProveedores = ({
  proveedores,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarProveedor
}) => {
  return (
    <Table striped borderless hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>Nombre</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {proveedores.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-4 text-muted">
              No hay proveedores registrados para mostrar.
            </td>
          </tr>
        ) : (
          proveedores.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.nombre}</strong></td>
              <td>{p.contacto || "—"}</td>
              <td>{p.telefono || "—"}</td>
              <td><small className="text-muted">{p.direccion || "—"}</small></td>
              <td className="text-center">
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="m-1"
                  onClick={() => abrirModalEdicion(p)}
                  title="Editar proveedor"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="m-1"
                  onClick={() => abrirModalEliminacion(p)}
                  title="Eliminar proveedor"
                >
                  <i className="bi bi-trash"></i>
                </Button>
                {copiarProveedor && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="m-1"
                    onClick={() => copiarProveedor(p)}
                    title="Copiar datos"
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default TablaProveedores;
