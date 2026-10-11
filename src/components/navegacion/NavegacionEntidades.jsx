import { Link } from 'react-router-dom';

const entidades = [
  { ruta: '/productos', nombre: 'Productos', icono: 'bi-capsule', descripcion: 'Catálogo y precios' },
  { ruta: '/inventario', nombre: 'Inventario', icono: 'bi-box-seam', descripcion: 'Existencias y lotes' },
  { ruta: '/categorias', nombre: 'Categorías', icono: 'bi-bookmarks', descripcion: 'Clasificación' },
  { ruta: '/marcas', nombre: 'Marcas', icono: 'bi-tags', descripcion: 'Laboratorios' },
  { ruta: '/proveedores', nombre: 'Proveedores', icono: 'bi-truck', descripcion: 'Contactos y compras' },
  { ruta: '/ventas', nombre: 'Ventas', icono: 'bi-receipt', descripcion: 'Operaciones de caja' },
  { ruta: '/detalle-ventas', nombre: 'Detalle de ventas', icono: 'bi-list-ul', descripcion: 'Productos vendidos' },
  { ruta: '/compras', nombre: 'Compras', icono: 'bi-cart-check', descripcion: 'Adquisiciones' },
  { ruta: '/detalle-compras', nombre: 'Detalle de compras', icono: 'bi-list-check', descripcion: 'Productos recibidos' },
  { ruta: '/perfiles', nombre: 'Perfiles', icono: 'bi-people', descripcion: 'Usuarios y roles' },
];

export default function NavegacionEntidades() {
  return (
    <section className="admin-entities-section" aria-labelledby="admin-entities-heading">
      <div className="admin-entities-heading"><div><span className="eyebrow">FARMACIA DASSY</span><h2 id="admin-entities-heading">Administración de entidades</h2></div><span>{entidades.length} módulos</span></div>
      <nav className="admin-entities-grid" aria-label="Entidades de administración">
        {entidades.map((entidad) => <Link to={entidad.ruta} className="admin-entity-card" key={entidad.ruta}><span className="admin-entity-icon"><i className={`bi ${entidad.icono}`} aria-hidden="true" /></span><span className="admin-entity-copy"><strong>{entidad.nombre}</strong><small>{entidad.descripcion}</small></span><i className="bi bi-arrow-up-right admin-entity-arrow" aria-hidden="true" /></Link>)}
      </nav>
    </section>
  );
}