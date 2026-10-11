import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icono from '../Icono';

export default function NavegacionInferior() {
  const { usuario } = useAuth();
  const location = useLocation();
  if (['/login', '/register', '/registro', '/bienvenida'].includes(location.pathname) || (location.pathname === '/' && !usuario)) return null;

  const rutaInicio = usuario?.rol === 'propietario' ? '/' : '/catalogo';
  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      <NavLink to={rutaInicio} end className={({ isActive }) => isActive ? 'bottom-link selected' : 'bottom-link'}><Icono nombre="inicio" /><span>Inicio</span></NavLink>
      <NavLink to="/catalogo#productos" className={({ isActive }) => isActive && location.hash ? 'bottom-link selected' : 'bottom-link'}><Icono nombre="buscar" /><span>Explorar</span></NavLink>
      {usuario?.rol === 'propietario' && <NavLink to="/productos" className={({ isActive }) => isActive ? 'bottom-link selected' : 'bottom-link'}><Icono nombre="caja" /><span>Inventario</span></NavLink>}
      <NavLink to={usuario ? '/perfiles' : '/login'} className={({ isActive }) => isActive ? 'bottom-link selected' : 'bottom-link'}><Icono nombre="usuario" /><span>Perfil</span></NavLink>
    </nav>
  );
}