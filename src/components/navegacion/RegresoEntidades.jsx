import { Link } from 'react-router-dom';
import Icono from '../Icono';

export default function RegresoEntidades() {
  return (
    <nav className="entity-return-bar" aria-label="Navegación de administración">
      <Link to="/" className="entity-return-link">
        <span className="entity-return-icon"><Icono nombre="flechaAtras" size={16} /></span>
        <span>Panel de administración</span>
      </Link>
    </nav>
  );
}