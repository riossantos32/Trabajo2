import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const navegar = useNavigate();
  const { login, usuario: usuarioActual } = useAuth();

  const iniciarSesion = async () => {
    if (!usuario || !contrasena) {
      setError("Por favor ingresa correo y contraseña");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      await login(usuario, contrasena);
      navegar("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Usuario o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioActual) {
      navegar("/");
    }
  }, [usuarioActual, navegar]);

  return (
    <div className="login-screen">
      <FormularioLogin
        usuario={usuario}
        contrasena={contrasena}
        error={error}
        setUsuario={setUsuario}
        setContrasena={setContrasena}
        iniciarSesion={iniciarSesion}
        cargando={cargando}
      />
    </div>
  );
};

export default Login;