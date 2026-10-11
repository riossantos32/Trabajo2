import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../database/supabaseconfig';
import TablaDetallesOperacion from '../components/administracion/TablaDetallesOperacion';

export default function DetalleCompras() {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    supabase.from('detalle_compras').select('id, compra_id, producto_id, cantidad_comprada, costo_unitario, fecha_vencimiento_lote, compras(id, fecha_compra, proveedores(nombre)), productos(nombre_comercial)').order('created_at', { ascending: false }).then(({ data, error: fallo }) => {
      if (!vigente) return;
      if (fallo) setError(`No se pudieron cargar los detalles de compras: ${fallo.message}`);
      setFilas((data || []).map((fila) => ({
        id: fila.id,
        operacion: fila.compras?.id?.slice(0, 8) || fila.compra_id.slice(0, 8),
        fecha: fila.compras?.fecha_compra ? new Date(fila.compras.fecha_compra).toLocaleDateString('es-NI') : '—',
        proveedor: fila.compras?.proveedores?.nombre || 'Proveedor',
        producto: fila.productos?.nombre_comercial || 'Producto',
        cantidad: fila.cantidad_comprada,
        costo: fila.costo_unitario,
        vencimiento: fila.fecha_vencimiento_lote,
      })));
      setCargando(false);
    });
    return () => { vigente = false; };
  }, []);

  return (
    <div className="admin-page entity-view">
      <header className="entity-view-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN · COMPRAS</span>
          <h1>Detalle de compras<span className="heading-dot">.</span></h1>
          <p>Productos, lotes y vencimientos recibidos de proveedores.</p>
        </div>
        <Link to="/compras" className="secondary-button entity-back">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Volver a compras
        </Link>
      </header>
      <TablaDetallesOperacion tipo="compra" filas={filas} cargando={cargando} error={error} />
    </div>
  );
}