export default function TablaDetallesOperacion({ tipo, filas, cargando, error }) {
  const compras = tipo === 'compra';
  const columnas = compras
    ? ['Compra', 'Fecha', 'Proveedor', 'Producto', 'Cantidad', 'Costo unitario', 'Vencimiento']
    : ['Venta', 'Fecha', 'Producto', 'Cantidad', 'Precio unitario', 'Subtotal'];

  return (
    <section className="detail-entity-table" aria-label={`Detalle de ${compras ? 'compras' : 'ventas'}`}>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {cargando ? <div className="catalog-loading"><span className="spinner" />Cargando detalles...</div> : <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr>{columnas.map((columna) => <th key={columna}>{columna}</th>)}</tr></thead><tbody>
        {filas.map((fila) => <tr key={fila.id}>
          <td>{fila.operacion}</td><td>{fila.fecha}</td>{compras && <td>{fila.proveedor}</td>}<td>{fila.producto}</td><td>{fila.cantidad}</td><td>C${Number(fila.costo).toFixed(2)}</td>{compras ? <td>{fila.vencimiento || '—'}</td> : null}{!compras ? <td>C${Number(fila.subtotal).toFixed(2)}</td> : null}
        </tr>)}
        {!filas.length && <tr><td className="table-empty" colSpan={columnas.length}>No hay detalles registrados.</td></tr>}
      </tbody></table></div>}
    </section>
  );
}