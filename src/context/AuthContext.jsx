import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState('');

  const obtenerPerfil = useCallback(async (authUser) => {
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id_usuario', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn(`No se pudo leer perfil en perfiles: ${error.message}`);
      return null;
    }
    return data;
  }, []);

  const usuarioDesdeAuth = useCallback(async (authUser) => {
    if (!authUser) return null;
    const perfil = await obtenerPerfil(authUser);
    const metadata = authUser.user_metadata || {};
    const rol = String(perfil?.rol || metadata.rol || 'propietario').trim().toLowerCase();

    const nombre = perfil?.nombre_completo || metadata.nombre || metadata.nombre_completo || authUser.email?.split('@')[0] || 'Usuario';

    return {
      id: authUser.id,
      email: authUser.email,
      nombre,
      rol,
    };
  }, [obtenerPerfil]);

  const login = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    try {
      const usuarioActual = await usuarioDesdeAuth(authData.user);
      localStorage.setItem('usuario-supabase', email);
      setUsuario(usuarioActual);
      setErrorPerfil('');
      return { ...authData, appUser: usuarioActual };
    } catch (error) {
      await supabase.auth.signOut();
      setUsuario(null);
      setErrorPerfil(error.message);
      throw error;
    }
  };

  const registrar = async ({ nombre, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol: 'cliente' } },
    });

    if (error) throw error;

    if (data.session && data.user) {
      const perfil = {
        id_usuario: data.user.id,
        correo: email,
        nombre_completo: nombre,
        rol: 'cliente',
      };
      await supabase
        .from('perfiles')
        .upsert(perfil, { onConflict: 'id_usuario' });

      const usuarioActual = { id: data.user.id, email, nombre, rol: 'cliente' };
      localStorage.setItem('usuario-supabase', email);
      setUsuario(usuarioActual);
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('usuario-supabase');
    setUsuario(null);
  };

  const tienePermiso = (nombrePermiso) => {
    if (!usuario) return false;
    // El propietario o admin tiene acceso total a todos los módulos
    if (usuario.rol === 'propietario' || usuario.rol === 'admin' || usuario.rol === 'gerente') {
      return true;
    }
    // Clientes solo tienen permisos para ver catálogo e inicio
    if (usuario.rol === 'cliente') {
      return ['ver_inicio', 'ver_catalogo'].includes(nombrePermiso);
    }
    return true;
  };

  useEffect(() => {
    let vigente = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) console.error('Error al recuperar sesión:', error);
      try {
        if (data?.session?.user) {
          const actual = await usuarioDesdeAuth(data.session.user);
          if (vigente) {
            setUsuario(actual);
            setErrorPerfil('');
          }
        }
      } catch (fallo) {
        if (vigente) {
          setUsuario(null);
          setErrorPerfil(fallo.message);
        }
      } finally {
        if (vigente) setCargando(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!session) {
        setUsuario(null);
        setErrorPerfil('');
        setCargando(false);
        return;
      }
      Promise.resolve().then(async () => {
        try {
          const actual = await usuarioDesdeAuth(session.user);
          if (vigente) {
            setUsuario(actual);
            setErrorPerfil('');
          }
        } catch (fallo) {
          if (vigente) {
            setUsuario(null);
            setErrorPerfil(fallo.message);
          }
        }
      });
    });

    return () => {
      vigente = false;
      listener.subscription.unsubscribe();
    };
  }, [usuarioDesdeAuth]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        errorPerfil,
        login,
        registrar,
        logout,
        tienePermiso,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;