import React from 'react';
import { Table, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TablaEmpleados = ({ empleados = [], abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Tipo de Empleado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((empleado) => (
          <tr key={empleado.id_empleado}>
            <td>{empleado.id_empleado}</td>
            <td>{empleado.nombre}</td>
            <td>{empleado.apellido}</td>
            <td>{empleado.tipo_empleado}</td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(empleado)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEliminacion(empleado)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaEmpleados;
