import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { supabase } from '../database/supabaseconfig';
import { useAuth } from '../context/AuthContext';
import Icono from '../components/Icono';

const imagenPorDefecto = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=85';

function saludoActual() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function obtenerFondoImagen(imagen) {
  try {
    const lienzo = document.createElement('canvas');
    lienzo.width = 28;
    lienzo.height = 28;
    const contexto = lienzo.getContext('2d', { willReadFrequently: true });
    if (!contexto) return null;

    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    const datos = contexto.getImageData(0, 0, lienzo.width, lienzo.height).data;
    const tonos = Array.from({ length: 24 }, () => ({ cantidad: 0, matiz: 0, saturacion: 0 }));
    let rojoTotal = 0;
    let verdeTotal = 0;
    let azulTotal = 0;
    let pixelesValidos = 0;

    for (let y = 4; y < 24; y += 1) {
      for (let x = 4; x < 24; x += 1) {
        const indice = (y * lienzo.width + x) * 4;
        const alfa = datos[indice + 3] / 255;
        if (alfa < 0.55) continue;

        const rojo = datos[indice] / 255;
        const verde = datos[indice + 1] / 255;
        const azul = datos[indice + 2] / 255;
        const maximo = Math.max(rojo, verde, azul);
        const minimo = Math.min(rojo, verde, azul);
        const diferencia = maximo - minimo;
        const luminosidad = (maximo + minimo) / 2;
        let matiz = 0;

        if (diferencia > 0) {
          if (maximo === rojo) matiz = ((verde - azul) / diferencia) % 6;
          else if (maximo === verde) matiz = (azul - rojo) / diferencia + 2;
          else matiz = (rojo - verde) / diferencia + 4;
          matiz = (matiz * 60 + 360) % 360;
        }

        const saturacion = diferencia === 0 ? 0 : diferencia / (1 - Math.abs(2 * luminosidad - 1));
        rojoTotal += rojo;
        verdeTotal += verde;
        azulTotal += azul;
        pixelesValidos += 1;

        if (saturacion >= 0.2 && luminosidad >= 0.12 && luminosidad <= 0.9) {
          const tono = tonos[Math.floor(matiz / 15) % tonos.length];
          tono.cantidad += 1;
          tono.matiz += matiz;
          tono.saturacion += saturacion;
        }
      }
    }

    const dominante = tonos.reduce((mejor, tono) => tono.cantidad > mejor.cantidad ? tono : mejor, tonos[0]);
    if (dominante.cantidad) {
      const matiz = Math.round(dominante.matiz / dominante.cantidad);
      const saturacion = Math.round(Math.min(36, Math.max(18, dominante.saturacion / dominante.cantidad * 34)));
      return `hsl(${matiz} ${saturacion}% 92%)`;
    }

    if (!pixelesValidos) return null;
    const promedioRojo = rojoTotal / pixelesValidos;
    const promedioVerde = verdeTotal / pixelesValidos;
    const promedioAzul = azulTotal / pixelesValidos;
    const maximo = Math.max(promedioRojo, promedioVerde, promedioAzul);
    const minimo = Math.min(promedioRojo, promedioVerde, promedioAzul);
    const diferencia = maximo - minimo;
    let matiz = 0;
    if (diferencia > 0) {
      if (maximo === promedioRojo) matiz = ((promedioVerde - promedioAzul) / diferencia) % 6;
      else if (maximo === promedioVerde) matiz = (promedioAzul - promedioRojo) / diferencia + 2;
      else matiz = (promedioRojo - promedioVerde) / diferencia + 4;
      matiz = (matiz * 60 + 360) % 360;
    }
    const saturacionPromedio = diferencia === 0 ? 0 : diferencia / (1 - Math.abs(2 * ((maximo + minimo) / 2) - 1));
    return `hsl(${Math.round(matiz)} ${Math.round(Math.max(8, saturacionPromedio * 20))}% 93%)`;
  } catch {
    return null;
  }
}

export default function Catalogo() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [coloresImagen, setColoresImagen] = useState({});
  const [inventario, setInventario] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [rotacion, setRotacion] = useState({});
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [busquedaEnfocada, setBusquedaEnfocada] = useState(false);
  const [indiceSugerencia, setIndiceSugerencia] = useState(-1);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [ordenCatalogo, setOrdenCatalogo] = useState('recomendados');
  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [avisoCarrito, setAvisoCarrito] = useState('');
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`dassydata-favoritos:${usuario?.id || 'visitante'}`) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let vigente = true;
    const cargarDatos = async () => {
      setCargando(true);
      const [productosResp, inventarioResp, categoriasResp, marcasResp, detallesResp] = await Promise.all([
        supabase.from('productos').select('*'),
        supabase.from('inventario').select('*'),
        supabase.from('categorias').select('id, nombre').order('nombre'),
        supabase.from('marcas').select('id, nombre').order('nombre'),
        supabase.from('detalle_ventas').select('producto_id, cantidad'),
      ]);
      if (!vigente) return;
      setProductos(productosResp.data || []);
      setInventario(inventarioResp.data || []);
      setCategorias(categoriasResp.data || []);
      setMarcas(marcasResp.data || []);
      const ventasPorProducto = {};
      (detallesResp.data || []).forEach((detalle) => {
        ventasPorProducto[detalle.producto_id] = (ventasPorProducto[detalle.producto_id] || 0) + Number(detalle.cantidad || 0);
      });
      setRotacion(ventasPorProducto);
      setCargando(false);
    };
    cargarDatos().catch((error) => {
      console.error('Error al cargar el catálogo:', error);
      if (vigente) setCargando(false);
    });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!seleccionado) return undefined;
    const overflowAnterior = document.body.style.overflow;
    const manejarEscape = (evento) => {
      if (evento.key === 'Escape') setSeleccionado(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', manejarEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', manejarEscape);
    };
  }, [seleccionado]);

  const obtenerExistencias = (producto) => Number(inventario.find((lote) => lote.producto_id === producto.id)?.cantidad_disponible || 0);
  const obtenerCategoria = (producto) => categorias.find((categoria) => categoria.id === producto.categoria_id)?.nombre || 'Sin categoría';
  const obtenerMarca = (producto) => marcas.find((marca) => marca.id === producto.marca_id)?.nombre || 'Farmacia Dassy';

  const productosFiltrados = useMemo(() => {
    const busqueda = textoBusqueda.trim().toLocaleLowerCase();
    const filtrados = productos.filter((producto) => {
      const coincideCategoria = categoriaSeleccionada === 'todas' || producto.categoria_id === categoriaSeleccionada;
      const categoria = categorias.find((item) => item.id === producto.categoria_id)?.nombre || '';
      const marca = marcas.find((item) => item.id === producto.marca_id)?.nombre || '';
      const coincideTexto = !busqueda || `${producto.nombre_comercial} ${producto.nombre_generico || ''} ${producto.descripcion || ''} ${categoria} ${marca}`.toLocaleLowerCase().includes(busqueda);
      return coincideCategoria && coincideTexto;
    });
    return filtrados.sort((primero, segundo) => {
      if (ordenCatalogo === 'nombre') return (primero.nombre_comercial || '').localeCompare(segundo.nombre_comercial || '', 'es');
      if (ordenCatalogo === 'precio-menor') return Number(primero.precio_venta_sugerido || 0) - Number(segundo.precio_venta_sugerido || 0);
      if (ordenCatalogo === 'precio-mayor') return Number(segundo.precio_venta_sugerido || 0) - Number(primero.precio_venta_sugerido || 0);
      return (rotacion[segundo.id] || 0) - (rotacion[primero.id] || 0);
    });
  }, [productos, categorias, marcas, textoBusqueda, categoriaSeleccionada, ordenCatalogo, rotacion]);

  const sugerencias = productosFiltrados.slice(0, 6);
  const mostrarSugerencias = busquedaEnfocada && Boolean(textoBusqueda.trim()) && !cargando;

  const seleccionarSugerencia = (producto) => {
    setTextoBusqueda(producto.nombre_comercial || '');
    setBusquedaEnfocada(false);
    setIndiceSugerencia(-1);
  };

  const manejarTecladoBusqueda = (evento) => {
    if (!sugerencias.length) {
      if (evento.key === 'Escape') setBusquedaEnfocada(false);
      return;
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setIndiceSugerencia((actual) => Math.min(actual + 1, sugerencias.length - 1));
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setIndiceSugerencia((actual) => actual <= 0 ? sugerencias.length - 1 : actual - 1);
    } else if (evento.key === 'Enter' && indiceSugerencia >= 0) {
      evento.preventDefault();
      seleccionarSugerencia(sugerencias[indiceSugerencia]);
    } else if (evento.key === 'Escape') {
      setBusquedaEnfocada(false);
      setIndiceSugerencia(-1);
    }
  };

  const cambiarFavorito = (producto, evento) => {
    evento.stopPropagation();
    const siguientes = favoritos.includes(producto.id) ? favoritos.filter((id) => id !== producto.id) : [...favoritos, producto.id];
    setFavoritos(siguientes);
    localStorage.setItem(`dassydata-favoritos:${usuario?.id || 'visitante'}`, JSON.stringify(siguientes));
  };

  const abrirDetalle = (producto) => {
    setCantidad(1);
    setAvisoCarrito('');
    setSeleccionado(producto);
  };

  const manejarCargaImagen = (productoId, evento) => {
    const color = obtenerFondoImagen(evento.currentTarget);
    if (!color) return;
    setColoresImagen((actuales) => actuales[productoId] === color ? actuales : { ...actuales, [productoId]: color });
  };

  const agregarAlCarrito = () => {
    if (!seleccionado || obtenerExistencias(seleccionado) < cantidad) return;
    const clave = `dassydata-carrito:${usuario?.id || 'visitante'}`;
    let carrito = [];
    try { carrito = JSON.parse(localStorage.getItem(clave) || '[]'); } catch { carrito = []; }
    const existe = carrito.find((item) => item.producto_id === seleccionado.id);
    const siguiente = existe
      ? carrito.map((item) => item.producto_id === seleccionado.id ? { ...item, cantidad: item.cantidad + cantidad } : item)
      : [...carrito, { producto_id: seleccionado.id, cantidad }];
    localStorage.setItem(clave, JSON.stringify(siguiente));
    setAvisoCarrito('Añadido a tu carrito.');
  };

  const populares = useMemo(() => [...productos].sort((a, b) => (rotacion[b.id] || 0) - (rotacion[a.id] || 0)).slice(0, 4), [productos, rotacion]);

  return (
    <div className="catalog-page">
      <section className="welcome-row">
        <div className="welcome-copy"><span className="eyebrow">{saludoActual()}</span><h1>{usuario?.nombre || 'Bienvenido'}<span className="heading-dot">.</span></h1><p>Tu salud, con información clara y a tu alcance.</p></div>
        <div className="welcome-tools"><button className="icon-button notification-button" aria-label="Notificaciones"><Icono nombre="campana" /><i /></button>{usuario ? <span className="avatar-large">{usuario.nombre?.charAt(0)?.toUpperCase() || 'D'}</span> : <Link className="avatar-large guest-avatar" to="/login"><Icono nombre="usuario" /></Link>}</div>
      </section>

      <div className="catalog-search-container">
        <div className="catalog-search" role="search">
          <Icono nombre="buscar" />
          <input
            value={textoBusqueda}
            onChange={(evento) => { setTextoBusqueda(evento.target.value); setIndiceSugerencia(-1); }}
            onFocus={() => setBusquedaEnfocada(true)}
            onBlur={() => setBusquedaEnfocada(false)}
            onKeyDown={manejarTecladoBusqueda}
            placeholder="Buscar medicamento, marca o categoría..."
            aria-label="Buscar medicamento"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={mostrarSugerencias}
            aria-controls="catalog-search-suggestions"
            aria-activedescendant={indiceSugerencia >= 0 ? `catalog-suggestion-${indiceSugerencia}` : undefined}
          />
          <button className="filter-button" type="button" aria-label="Quitar filtros" onClick={() => { setTextoBusqueda(''); setCategoriaSeleccionada('todas'); setIndiceSugerencia(-1); }}><Icono nombre="filtro" /></button>
        </div>
        {mostrarSugerencias && (
          <div className="catalog-suggestions" id="catalog-search-suggestions" role="listbox" aria-label="Opciones de búsqueda">
            {sugerencias.length ? sugerencias.map((producto, indice) => (
              <button
                key={producto.id}
                id={`catalog-suggestion-${indice}`}
                className={`catalog-suggestion ${indice === indiceSugerencia ? 'active' : ''}`}
                type="button"
                role="option"
                aria-selected={indice === indiceSugerencia}
                onMouseDown={(evento) => evento.preventDefault()}
                onClick={() => seleccionarSugerencia(producto)}
              >
                <span className="catalog-suggestion-icon" aria-hidden="true" style={coloresImagen[producto.id] ? { '--product-image-background': coloresImagen[producto.id] } : undefined}>
                  <img
                    crossOrigin="anonymous"
                    src={producto.imagen_url || imagenPorDefecto}
                    alt=""
                    onLoad={(evento) => manejarCargaImagen(producto.id, evento)}
                    onError={(evento) => { evento.currentTarget.src = imagenPorDefecto; }}
                  />
                </span>
                <span className="catalog-suggestion-copy">
                  <strong>{producto.nombre_comercial}</strong>
                  <small>{obtenerMarca(producto)} · {obtenerCategoria(producto)}</small>
                </span>
                <span className="catalog-suggestion-price">C${Number(producto.precio_venta_sugerido || 0).toFixed(2)}</span>
              </button>
            )) : <p className="catalog-suggestions-empty">No encontramos coincidencias</p>}
          </div>
        )}
      </div>

      <section className="hero-banner"><div className="hero-content"><span className="hero-label">FARMACIA DASSY · DASSYDATA</span><h2>Encuentra tu medicamento ideal.</h2><p>Explora productos y consulta disponibilidad en Farmacia Dassy.</p><a href="#productos" className="hero-cta">Explorar catálogo <Icono nombre="flecha" size={17} /></a></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="medicine-pack"><span>DASSY</span><strong>BIENESTAR</strong><small>USO SEGURO</small><i /></div><div className="medicine-capsule"><b /><b /></div><div className="medicine-pill" /></div></section>

      <section className="section-block category-section" id="categorias"><div className="section-heading"><div><span className="eyebrow">ENCUENTRA LO QUE BUSCAS</span><h2>Categorías</h2></div><span className="section-note">{categorias.length} disponibles</span></div><div className="category-list" role="group" aria-label="Filtrar por categoría">
        <button className={`category-chip ${categoriaSeleccionada === 'todas' ? 'chosen' : ''}`} onClick={() => setCategoriaSeleccionada('todas')}><span className="category-symbol"><Icono nombre="caja" size={17} /></span>Todas</button>
        {categorias.map((categoria, indice) => <button key={categoria.id} className={`category-chip ${categoriaSeleccionada === categoria.id ? 'chosen' : ''}`} onClick={() => setCategoriaSeleccionada(categoria.id)}><span className={`category-symbol symbol-${(indice + 1) % 4}`}><Icono nombre="mas" size={17} /></span>{categoria.nombre}</button>)}
        {!categorias.length && <span className="section-note">Las categorías aparecerán cuando estén registradas.</span>}
      </div></section>

      <section className="section-block popular-section"><div className="section-heading"><div><span className="eyebrow">MARCAS FARMACÉUTICAS</span><h2>Laboratorios y marcas</h2></div><a href="#marcas" className="text-link">Ver todas <Icono nombre="flecha" size={15} /></a></div><div className="popular-strip" id="marcas">
        {marcas.slice(0, 4).map((marca, indice) => <button className="popular-item" key={marca.id} onClick={() => setTextoBusqueda(marca.nombre)}><span className={`popular-icon popular-${indice}`}><Icono nombre="caja" size={19} /></span><span><strong>{marca.nombre}</strong><small>Marca farmacéutica</small></span><Icono nombre="flecha" size={16} /></button>)}
        {!marcas.length && <p className="section-note">Las marcas aparecerán al conectar el catálogo.</p>}
      </div></section>

      <section className="section-block popular-section"><div className="section-heading"><div><span className="eyebrow">LO MÁS VENDIDO</span><h2>Productos populares</h2></div><a href="#productos" className="text-link">Ver catálogo <Icono nombre="flecha" size={15} /></a></div><div className="popular-strip">
        {populares.map((producto, indice) => <button className="popular-item" key={producto.id} onClick={() => abrirDetalle(producto)}><span className={`popular-icon popular-${indice}`}><Icono nombre="caja" size={19} /></span><span><strong>{producto.nombre_comercial}</strong><small>{rotacion[producto.id] || 0} unidades vendidas</small></span><Icono nombre="flecha" size={16} /></button>)}
        {!populares.length && <p className="section-note">Los productos destacados aparecerán aquí.</p>}
      </div></section>

      <section className="section-block product-section" id="productos">
        <div className="section-heading"><div><span className="eyebrow">DISPONIBLES EN FARMACIA DASSY</span><h2>Catálogo de productos</h2></div><span className="product-count" aria-live="polite">{productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}</span></div>
        <div className="catalog-tools">
          <div className="catalog-filter-summary">
            <span>{categoriaSeleccionada === 'todas' ? 'Todos los productos' : categorias.find((categoria) => categoria.id === categoriaSeleccionada)?.nombre || 'Categoría seleccionada'}</span>
            {(textoBusqueda || categoriaSeleccionada !== 'todas') && <button type="button" onClick={() => { setTextoBusqueda(''); setCategoriaSeleccionada('todas'); }}>Limpiar filtros</button>}
          </div>
          <label className="catalog-sort"><Icono nombre="filtro" size={15} /><span>Ordenar</span><select value={ordenCatalogo} onChange={(evento) => setOrdenCatalogo(evento.target.value)} aria-label="Ordenar productos">
            <option value="recomendados">Recomendados</option>
            <option value="nombre">Nombre A-Z</option>
            <option value="precio-menor">Precio: menor a mayor</option>
            <option value="precio-mayor">Precio: mayor a menor</option>
          </select></label>
        </div>
        {cargando ? <div className="catalog-loading"><span className="spinner" />Cargando productos...</div> : productosFiltrados.length ? <div className="product-grid">{productosFiltrados.map((producto, indice) => {
          const stock = obtenerExistencias(producto);
          return <article className="product-card" key={producto.id} style={{ '--card-index': Math.min(indice, 10) }} role="button" tabIndex={0} onClick={() => abrirDetalle(producto)} onKeyDown={(evento) => { if (evento.key === 'Enter' || evento.key === ' ') abrirDetalle(producto); }}>
            <div className="product-visual" style={coloresImagen[producto.id] ? { '--product-image-background': coloresImagen[producto.id] } : undefined}><img crossOrigin="anonymous" src={producto.imagen_url || imagenPorDefecto} alt={producto.nombre_comercial} loading="lazy" onLoad={(evento) => manejarCargaImagen(producto.id, evento)} onError={(evento) => { evento.currentTarget.src = imagenPorDefecto; }} /><span className={`availability ${stock > 0 ? '' : 'unavailable'}`}>{stock > 0 ? `${stock} disponibles` : 'Agotado'}</span><button className={`favorite-button ${favoritos.includes(producto.id) ? 'is-favorite' : ''}`} onClick={(evento) => cambiarFavorito(producto, evento)} aria-label="Guardar en favoritos"><Icono nombre="corazon" size={18} /></button></div>
            <div className="product-info"><span className="product-category">{obtenerCategoria(producto)} · {obtenerMarca(producto)}</span><h3>{producto.nombre_comercial}</h3><div className="product-bottom"><strong>C${Number(producto.precio_venta_sugerido || 0).toFixed(2)}</strong><span className="rotation-tag">{rotacion[producto.id] > 5 ? 'Alta rotación' : rotacion[producto.id] ? 'Baja rotación' : 'Ver detalles'}</span></div></div>
          </article>;
        })}</div> : <div className="empty-state"><span className="empty-mark"><Icono nombre="buscar" size={25} /></span><h3>No encontramos productos</h3><p>Prueba con otro término o categoría.</p></div>}
      </section>

      <footer className="page-footer"><span>DassyData <b>·</b> Farmacia Dassy</span><span>Información para acompañar tu bienestar</span></footer>

      {seleccionado && createPortal(<div className="modal-backdrop product-detail-backdrop" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setSeleccionado(null); }}><section className="product-detail" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="icon-button detail-close" onClick={() => setSeleccionado(null)} aria-label="Cerrar detalle del producto"><Icono nombre="cerrar" /></button>
        <button className={`favorite-button detail-favorite ${favoritos.includes(seleccionado.id) ? 'is-favorite' : ''}`} onClick={(evento) => cambiarFavorito(seleccionado, evento)} aria-label="Guardar en favoritos"><Icono nombre="corazon" /></button>
        <div className="detail-image" style={coloresImagen[seleccionado.id] ? { '--product-image-background': coloresImagen[seleccionado.id] } : undefined}><img crossOrigin="anonymous" src={seleccionado.imagen_url || imagenPorDefecto} alt={seleccionado.nombre_comercial} onLoad={(evento) => manejarCargaImagen(seleccionado.id, evento)} /></div>
        <div className="detail-copy"><span className="eyebrow">{obtenerMarca(seleccionado)} · {obtenerCategoria(seleccionado)}</span><h2 id="detail-title">{seleccionado.nombre_comercial}</h2><strong className="detail-price">C${Number(seleccionado.precio_venta_sugerido || 0).toFixed(2)}</strong>
          <div className="detail-stock"><span className="status-dot" />{obtenerExistencias(seleccionado) > 0 ? `${obtenerExistencias(seleccionado)} unidades disponibles` : 'Consulta disponibilidad en farmacia'}</div>
          <div className="detail-quantity"><strong>Cantidad</strong><div className="quantity-stepper"><button onClick={() => setCantidad((actual) => Math.max(1, actual - 1))} aria-label="Reducir cantidad">−</button><span>{cantidad}</span><button onClick={() => setCantidad((actual) => Math.min(Math.max(1, obtenerExistencias(seleccionado)), actual + 1))} aria-label="Aumentar cantidad" disabled={cantidad >= obtenerExistencias(seleccionado)}>+</button></div></div>
          <h3>Descripción</h3><p>{seleccionado.descripcion || [seleccionado.nombre_generico, seleccionado.concentracion, seleccionado.presentacion].filter(Boolean).join(' · ') || 'Consulta con nuestro equipo farmacéutico para conocer más sobre este producto.'}</p>
          <div className="detail-actions"><div><small>Total</small><strong>C${(Number(seleccionado.precio_venta_sugerido || 0) * cantidad).toFixed(2)}</strong></div><button className="primary-button" onClick={agregarAlCarrito} disabled={obtenerExistencias(seleccionado) < cantidad}>{obtenerExistencias(seleccionado) > 0 ? 'Añadir al carrito' : 'Sin existencias'}</button></div>
          {avisoCarrito && <p className="cart-confirmation" role="status">{avisoCarrito}</p>}
        </div>
      </section></div>, document.body)}
    </div>
  );
}
