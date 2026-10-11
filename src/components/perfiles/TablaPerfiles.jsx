import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaPerfiles = ({
  perfiles,
  abrirModalEdicion,
  copiarPerfil
}) => {
  return (
    <Table striped borderless hover responsive size="sm" className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>Nombre Completo</th>
          <th>Correo Electrónico</th>
          <th>Rol de Usuario</th>
          <th>Fecha Registro</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {perfiles.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-4 text-muted">
              No hay perfiles de usuario registrados.
            </td>
          </tr>
        ) : (
          perfiles.map((p) => {
            const esPropietario = p.rol === "propietario";
            return (
              <tr key={p.id_usuario}>
                <td><strong>{p.nombre_completo || "Sin nombre"}</strong></td>
                <td>{p.correo}</td>
                <td>
                  <Badge bg={esPropietario ? "primary" : "secondary"} className="text-capitalize fs-6">
                    {p.rol || "cliente"}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                  </small>
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(p)}
                    title="Editar rol"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  {copiarPerfil && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="m-1"
                      onClick={() => copiarPerfil(p)}
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

export default TablaPerfiles;
