import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaMarcas = ({
  marcas,
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarMarca
}) => {
  return (
    <Table striped borderless hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre de Marca</th>
          <th>Fecha Registro</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {marcas.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center py-4 text-muted">
              No hay marcas registradas para mostrar.
            </td>
          </tr>
        ) : (
          marcas.map((marca) => (
            <tr key={marca.id}>
              <td><small className="text-muted">{marca.id?.slice?.(0, 8) || marca.id}</small></td>
              <td><strong>{marca.nombre}</strong></td>
              <td>
                <small className="text-muted">
                  {marca.created_at ? new Date(marca.created_at).toLocaleDateString() : "—"}
                </small>
              </td>
              <td className="text-center">
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="m-1"
                  onClick={() => abrirModalEdicion(marca)}
                  title="Editar marca"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="m-1"
                  onClick={() => abrirModalEliminacion(marca)}
                  title="Eliminar marca"
                >
                  <i className="bi bi-trash"></i>
                </Button>
                {copiarMarca && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="m-1"
                    onClick={() => copiarMarca(marca)}
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

export default TablaMarcas;
