import React from 'react';
import { Table, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TablaClientes = ({ clientes = [], abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Celular</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id_cliente}>
            <td>{cliente.id_cliente}</td>
            <td>{cliente.nombre}</td>
            <td>{cliente.apellido}</td>
            <td>{cliente.celular}</td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(cliente)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEliminacion(cliente)}
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

export default TablaClientes;
