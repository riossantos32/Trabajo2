import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icono from '../Icono';

export default function EncabezadoDassy() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const salir = async () => {
    await logout();
    navigate('/catalogo');
  };

  if (location.pathname === '/bienvenida' || (location.pathname === '/' && !usuario)) return null;

  return (
    <header className="site-header">
      <Link className="brand" to={usuario?.rol === 'propietario' ? '/' : usuario ? '/catalogo' : '/bienvenida'} aria-label="DassyData, inicio">
        <span className="brand-mark"><span /></span>
        <span>Dassy<span>Data</span><small>FARMACIA DASSY</small></span>
      </Link>
      <nav className="top-nav" aria-label="Navegación principal">
        <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'top-link active' : 'top-link'}>Catálogo</NavLink>
        {usuario?.rol === 'propietario' && <NavLink to="/" end className={({ isActive }) => isActive ? 'top-link active' : 'top-link'}>Administración</NavLink>}
        {usuario ? <button className="account-button" onClick={salir} title="Cerrar sesión" aria-label="Cerrar sesión"><span className="avatar-small">{usuario.nombre?.charAt(0)?.toUpperCase() || 'D'}</span><span className="account-name">{usuario.nombre}</span><Icono nombre="salir" /></button> : <Link className="header-login" to="/login">Iniciar sesión <Icono nombre="flecha" /></Link>}
      </nav>
    </header>
  );
}