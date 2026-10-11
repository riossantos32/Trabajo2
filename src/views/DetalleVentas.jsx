import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../database/supabaseconfig';
import TablaDetallesOperacion from '../components/administracion/TablaDetallesOperacion';

export default function DetalleVentas() {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    supabase.from('detalle_ventas').select('id, venta_id, producto_id, cantidad, precio_unitario, subtotal, ventas(id, fecha_venta), productos(nombre_comercial)').order('created_at', { ascending: false }).then(({ data, error: fallo }) => {
      if (!vigente) return;
      if (fallo) setError(`No se pudieron cargar los detalles de ventas: ${fallo.message}`);
      setFilas((data || []).map((fila) => ({
        id: fila.id,
        operacion: fila.ventas?.id?.slice(0, 8) || fila.venta_id.slice(0, 8),
        fecha: fila.ventas?.fecha_venta ? new Date(fila.ventas.fecha_venta).toLocaleDateString('es-NI') : '—',
        producto: fila.productos?.nombre_comercial || 'Producto',
        cantidad: fila.cantidad,
        costo: fila.precio_unitario,
        subtotal: fila.subtotal,
      })));
      setCargando(false);
    });
    return () => { vigente = false; };
  }, []);

  return (
    <div className="admin-page entity-view">
      <header className="entity-view-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN · VENTAS</span>
          <h1>Detalle de ventas<span className="heading-dot">.</span></h1>
          <p>Productos y cantidades asociados a cada venta.</p>
        </div>
        <Link to="/ventas" className="secondary-button entity-back">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Volver a ventas
        </Link>
      </header>
      <TablaDetallesOperacion tipo="venta" filas={filas} cargando={cargando} error={error} />
    </div>
  );
}