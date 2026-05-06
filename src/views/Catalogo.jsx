import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../database/supabaseconfig';
import TarjetaCatalogo from '../components/catalogo/TarjetaCatalogo';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('0');

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre_categoria');

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err.message);
    }
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias (nombre_categoria)')
        .order('id_producto', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  useEffect(() => {
    const texto = textoBusqueda.toLowerCase().trim();
    let resultado = productos;

    if (categoriaSeleccionada !== '0') {
      const categoriaId = parseInt(categoriaSeleccionada, 10);
      resultado = resultado.filter((producto) => producto.categoria_id === categoriaId);
    }

    if (texto) {
      resultado = resultado.filter((producto) =>
        producto.nombre_producto?.toLowerCase().includes(texto) ||
        producto.descripcion?.toLowerCase().includes(texto) ||
        producto.categorias?.nombre_categoria?.toLowerCase().includes(texto)
      );
    }

    setProductosFiltrados(resultado);
  }, [textoBusqueda, categoriaSeleccionada, productos]);

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={8}>
          <h3 className="mb-1">Catálogo de Productos</h3>
          <p className="text-muted mb-0">Explora los productos disponibles con imágenes y detalles.</p>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">Categoría</Form.Label>
            <Form.Select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
              <option value="0">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} lg={8}>
          <Form.Group>
            <Form.Label className="fw-semibold">Buscar</Form.Label>
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : productosFiltrados.length === 0 ? (
        <Alert variant="warning">No se encontraron productos con los criterios seleccionados.</Alert>
      ) : (
        <Row xs={1} md={2} xl={3} className="g-4">
          {productosFiltrados.map((producto) => (
            <Col key={producto.id_producto}>
              <TarjetaCatalogo producto={producto} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Catalogo;
