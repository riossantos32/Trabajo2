import { Link } from 'react-router-dom';
import Icono from '../components/Icono';

export default function Bienvenida() {
  return (
    <main className="welcome-screen">
      <div className="welcome-brand"><span className="brand-mark"><span /></span><span>Dassy<span>Data</span><small>FARMACIA DASSY</small></span></div>
      <div className="welcome-art" aria-hidden="true">
        <span className="welcome-orbit orbit-a" /><span className="welcome-orbit orbit-b" />
        <span className="welcome-capsule capsule-a"><i /><i /></span><span className="welcome-capsule capsule-b"><i /><i /></span>
        <span className="welcome-pill pill-a" /><span className="welcome-pill pill-b" /><span className="welcome-bottle"><i /><b>D</b></span>
      </div>
      <div className="welcome-copy-block"><span className="eyebrow">FARMACIA DASSY · DASSYDATA</span><h1>Análisis<br /><em>inteligente.</em></h1><p>Encuentra productos y consulta su disponibilidad con información clara.</p></div>
      <Link to="/catalogo" className="welcome-start">Empezar <span><Icono nombre="flecha" /></span></Link>
    </main>
  );
}