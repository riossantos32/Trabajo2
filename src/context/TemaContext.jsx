import { useEffect, useState } from 'react';
import { TemaContext } from './Tema';

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => window.localStorage.getItem('dassydata-tema') || 'dia');

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    window.localStorage.setItem('dassydata-tema', tema);
  }, [tema]);

  return <TemaContext.Provider value={{ tema, setTema }}>{children}</TemaContext.Provider>;
}