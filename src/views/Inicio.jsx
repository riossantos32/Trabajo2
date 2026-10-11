import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { supabase } from "../database/supabaseconfig";
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import NavegacionEntidades from "../components/navegacion/NavegacionEntidades";

const COLORES = ["#2e8bcf", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8", "#fd7e14"];

const Inicio = () => {
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA")
  );
  const [fechaHasta, setFechaHasta] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const graficoHoraRef = useRef(null);
  const graficoCategoriaRef = useRef(null);

  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    cantidadVentas: 0,
    totalProductos: 0,
    totalStockInventario: 0,
    ventasPorHora: [],
    ventasPorCategoria: []
  });

  useEffect(() => {
    cargarDatos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  const cargarDatos = async (desde, hasta) => {
    try {
      setCargando(true);
      const inicioRango = `${desde} 00:00:00`;
      const finRango = `${hasta} 23:59:59`;

      const [ventasResp, prodsResp, invResp, catResp] = await Promise.all([
        supabase.from("ventas").select("*").gte("fecha_venta", inicioRango).lte("fecha_venta", finRango),
        supabase.from("productos").select("*"),
        supabase.from("inventario").select("*"),
        supabase.from("categorias").select("*")
      ]);

      const ventas = ventasResp.data || [];
      const productos = prodsResp.data || [];
      const inventario = invResp.data || [];
      const categorias = catResp.data || [];

      const mapaCategorias = new Map(
        categorias.map(c => [c.id || c.id_categoria, c.nombre || c.nombre_categoria || "Sin categoría"])
      );
      const mapaProdCat = new Map(
        productos.map(p => [p.id || p.id_producto, mapaCategorias.get(p.categoria_id || p.categoria_producto) || "General"])
      );

      // Cargar detalles de ventas
      let detalles = [];
      const idsVentas = ventas.map(v => v.id || v.id_venta);
      if (idsVentas.length > 0) {
        let detResp = await supabase.from("detalle_ventas").select("*").in("venta_id", idsVentas);
        if (detResp.error || !detResp.data?.length) {
          detResp = await supabase.from("detalles_ventas").select("*").in("id_venta", idsVentas);
        }
        detalles = detResp.data || [];
      }

      let productosVendidos = 0;
      let ventasPorCatMap = {};

      detalles.forEach(d => {
        const cant = Number(d.cantidad || 0);
        const sub = Number(d.subtotal || (cant * Number(d.precio_unitario || 0)));
        productosVendidos += cant;

        const prodId = d.producto_id || d.id_producto;
        const catNombre = mapaProdCat.get(prodId) || "Medicamentos";
        ventasPorCatMap[catNombre] = (ventasPorCatMap[catNombre] || 0) + sub;
      });

      const ventasPorCategoria = Object.entries(ventasPorCatMap).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
      })).sort((a, b) => b.value - a.value);

      const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total_venta != null ? v.total_venta : v.total || 0), 0);
      const ventasEfectivo = ventas
        .filter(v => (v.metodo_pago || "").toLowerCase() === "efectivo")
        .reduce((sum, v) => sum + Number(v.total_venta != null ? v.total_venta : v.total || 0), 0);
      const ventasTarjeta = ventas
        .filter(v => (v.metodo_pago || "").toLowerCase() === "tarjeta")
        .reduce((sum, v) => sum + Number(v.total_venta != null ? v.total_venta : v.total || 0), 0);

      const horaMap = Array(24).fill(0);
      ventas.forEach(v => {
        if (!v.fecha_venta) return;
        const hora = new Date(v.fecha_venta).getHours();
        horaMap[hora] += Number(v.total_venta != null ? v.total_venta : v.total || 0);
      });

      const ventasPorHora = [];
      let acumulado = 0;
      for (let h = 8; h <= 20; h++) {
        acumulado += horaMap[h];
        ventasPorHora.push({
          hora: `${h.toString().padStart(2, "0")}:00`,
          total: Math.round(acumulado)
        });
      }

      const totalStockInventario = inventario.reduce((sum, item) => sum + Number(item.cantidad_disponible || 0), 0);

      setEstadisticas({
        totalVentas,
        ventasEfectivo,
        ventasTarjeta,
        productosVendidos,
        cantidadVentas: ventas.length,
        totalProductos: productos.length,
        totalStockInventario,
        ventasPorHora,
        ventasPorCategoria
      });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = async () => {
    try {
      setCargando(true);
      const { data: ventas } = await supabase.from("ventas").select("*");
      const wb = XLSX.utils.book_new();
      const wsVentas = XLSX.utils.json_to_sheet(ventas || [{ Mensaje: "Sin ventas" }]);
      XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas_DassyData");
      XLSX.writeFile(wb, `Reporte_DassyData_${fechaDesde}_a_${fechaHasta}.xlsx`);
    } catch (err) {
      alert("Error al generar el Excel.");
    } finally {
      setCargando(false);
    }
  };

  const generarPdfGeneral = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.setFontSize(18);
      pdf.setTextColor("#1068db");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte General - Farmacia Dassy", 14, 20);

      pdf.setFontSize(10);
      pdf.setTextColor("#555555");
      pdf.text(`Rango: ${fechaDesde} al ${fechaHasta}`, 14, 28);

      autoTable(pdf, {
        startY: 35,
        head: [["Indicador", "Valor"]],
        body: [
          ["Total Ingresos por Ventas", `C$ ${estadisticas.totalVentas.toFixed(2)}`],
          ["Ventas en Efectivo", `C$ ${estadisticas.ventasEfectivo.toFixed(2)}`],
          ["Ventas con Tarjeta", `C$ ${estadisticas.ventasTarjeta.toFixed(2)}`],
          ["Cantidad de Ventas Realizadas", `${estadisticas.cantidadVentas}`],
          ["Unidades Vendidas", `${estadisticas.productosVendidos}`],
          ["Productos Registrados", `${estadisticas.totalProductos}`],
          ["Stock Total en Inventario", `${estadisticas.totalStockInventario}`],
        ]
      });

      pdf.save(`Reporte_FarmaciaDassy_${fechaDesde}_a_${fechaHasta}.pdf`);
    } catch (err) {
      alert("Error al generar PDF");
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={7}>
          <h2 className="text-primary mb-1 fw-bold">
            <i className="bi bi-speedometer2 me-2"></i>Panel Principal · Farmacia Dassy
          </h2>
          <p className="text-muted mb-0">Resumen operativo, métricas y reportes inteligentes de DassyData</p>
        </Col>
        <Col xs={12} md={5} className="mt-3 mt-md-0 d-flex justify-content-md-end gap-2">
          <Button variant="success" onClick={descargarExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i> Excel
          </Button>
          <Button variant="danger" onClick={generarPdfGeneral}>
            <i className="bi bi-file-earmark-pdf me-1"></i> PDF
          </Button>
        </Col>
      </Row>

      <NavegacionEntidades />

      {/* Filtros de Fecha */}
      <Card className="shadow-sm mb-4 border-0 bg-light">
        <Card.Body className="py-2">
          <Row className="align-items-center g-2">
            <Col xs={12} sm={4}>
              <Form.Group className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0 fw-bold small text-muted">Desde:</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0 fw-bold small text-muted">Hasta:</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={4} className="text-sm-end text-muted small">
              {cargando ? <Spinner animation="border" size="sm" variant="primary" /> : "Datos sincronizados"}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm border-0 border-start border-primary border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Total Ventas</small>
                  <h4 className="mb-0 fw-bold text-primary mt-1">
                    C${estadisticas.totalVentas.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary fs-4">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm border-0 border-start border-success border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Existencias Stock</small>
                  <h4 className="mb-0 fw-bold text-success mt-1">
                    {estadisticas.totalStockInventario} unid.
                  </h4>
                </div>
                <div className="rounded-circle bg-success bg-opacity-10 p-3 text-success fs-4">
                  <i className="bi bi-boxes"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm border-0 border-start border-info border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Referencias Catálogo</small>
                  <h4 className="mb-0 fw-bold text-info mt-1">
                    {estadisticas.totalProductos}
                  </h4>
                </div>
                <div className="rounded-circle bg-info bg-opacity-10 p-3 text-info fs-4">
                  <i className="bi bi-bag-heart"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm border-0 border-start border-warning border-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Transacciones</small>
                  <h4 className="mb-0 fw-bold text-warning mt-1">
                    {estadisticas.cantidadVentas}
                  </h4>
                </div>
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 text-warning fs-4">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos Recharts */}
      <Row className="g-4 mb-4">
        <Col xs={12} lg={7}>
          <Card className="h-100 shadow-sm border-0" ref={graficoHoraRef}>
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="bi bi-graph-up me-2 text-primary"></i>
                Ventas Acumuladas por Hora
              </h5>
            </Card.Header>
            <Card.Body style={{ height: "320px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={estadisticas.ventasPorHora}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hora" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip formatter={(val) => [`C$ ${val}`, "Monto Acumulado"]} />
                  <Line type="monotone" dataKey="total" stroke="#2e8bcf" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="h-100 shadow-sm border-0" ref={graficoCategoriaRef}>
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="bi bi-pie-chart-fill me-2 text-success"></i>
                Ventas por Categoría
              </h5>
            </Card.Header>
            <Card.Body style={{ height: "320px" }}>
              {estadisticas.ventasPorCategoria.length === 0 ? (
                <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                  Sin ventas registradas en este periodo
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadisticas.ventasPorCategoria}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {estadisticas.ventasPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`C$ ${val}`, "Venta"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;