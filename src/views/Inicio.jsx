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

const Inicio = () => {
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" }));
  const [fechaHasta, setFechaHasta] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" }));

  // Referencias exclusivas para los contenedores visuales de los gráficos
  const graficoHoraRef = useRef(null);
  const graficoCategoriaRef = useRef(null);

  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    montoProductos: 0,
    cantidadVentas: 0,
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

      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("id_venta, total, fecha_venta, metodo_pago")
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango);

      if (error) throw error;

      const idsVentas = ventas?.map(v => v.id_venta) || [];

      let productosVendidos = 0;
      let montoProductos = 0;
      let ventasPorCategoria = [];

      if (idsVentas.length > 0) {
        const { data: detalles } = await supabase
          .from("detalles_ventas")
          .select(`
            cantidad, 
            subtotal,
            productos (
              nombre_producto,
              categorias (nombre_categoria)
            )
          `)
          .in("id_venta", idsVentas);

        detalles?.forEach(d => {
          productosVendidos += d.cantidad || 0;
          montoProductos += d.subtotal || 0;

          const categoria = d.productos?.categorias?.nombre_categoria || "Sin categoría";
          const existente = ventasPorCategoria.find(c => c.name === categoria);
          
          if (existente) {
            existente.value += d.subtotal || 0;
          } else {
            ventasPorCategoria.push({ name: categoria, value: d.subtotal || 0 });
          }
        });

        ventasPorCategoria.sort((a, b) => b.value - a.value);
      }

      const totalVentas = ventas?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasEfectivo = ventas?.filter(v => v.metodo_pago === "efectivo")
        .reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasTarjeta = ventas?.filter(v => v.metodo_pago === "tarjeta")
        .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

      const horaMap = Array(24).fill(0);
      ventas?.forEach(venta => {
        if (!venta.fecha_venta) return;
        const hora = new Date(venta.fecha_venta).getHours();
        horaMap[hora] += venta.total || 0;
      });

      const ventasPorHora = [];
      let acumulado = 0;
      for (let h = 8; h <= 22; h++) {
        acumulado += horaMap[h];
        ventasPorHora.push({
          hora: `${h.toString().padStart(2, "0")}:00`,
          total: Math.round(acumulado)
        });
      }

      setEstadisticas({
        totalVentas,
        ventasEfectivo,
        ventasTarjeta,
        productosVendidos,
        montoProductos,
        cantidadVentas: ventas?.length || 0,
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
      const inicioRango = `${fechaDesde} 00:00:00`;
      const finRango = `${fechaHasta} 23:59:59`;

      const { data: ventas, error: errorVentas } = await supabase
        .from("ventas")
        .select(`id_venta, fecha_venta, total, metodo_pago, id_empleado, id_cliente`)
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango)
        .order("fecha_venta", { ascending: false });

      if (errorVentas) throw errorVentas;

      const idsVentas = ventas?.map(v => v.id_venta) || [];
      let detallesVenta = [];

      if (idsVentas.length > 0) {
        const { data: detalles, error: errorDetalles } = await supabase
          .from("detalles_ventas")
          .select(`id_detalle, id_venta, cantidad, precio_unitario, subtotal, id_producto, productos (nombre_producto, categorias (nombre_categoria))`)
          .in("id_venta", idsVentas)
          .order("id_venta");

        if (errorDetalles) console.error("Error en detalles:", errorDetalles);
        else detallesVenta = detalles || [];
      }

      const wb = XLSX.utils.book_new();

      if (ventas && ventas.length > 0) {
        const wsVentas = XLSX.utils.json_to_sheet(ventas);
        XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");
      } else {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Mensaje: "No hay ventas en este rango" }]), "Ventas");
      }

      if (detallesVenta && detallesVenta.length > 0) {
        const wsDetalles = XLSX.utils.json_to_sheet(detallesVenta);
        XLSX.utils.book_append_sheet(wb, wsDetalles, "Detalles_Ventas");
      } else {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Mensaje: "No hay detalles de ventas" }]), "Detalles_Ventas");
      }

      XLSX.writeFile(wb, `Reporte_Ventas_${fechaDesde}_a_${fechaHasta}.xlsx`);

    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el Excel.");
    } finally {
      setCargando(false);
    }
  };

  const generarPdfVentasHora = async () => {
    try {
      if (!graficoHoraRef.current) return;
      const canvas = await html2canvas(graficoHoraRef.current, { scale: 2 });
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setFontSize(18);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte de Ventas por Hora", 14, 15);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

      const imagen = canvas.toDataURL("image/png");
      pdf.addImage(imagen, "PNG", 10, 30, 190, 80);

      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen General", 14, 115);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);

      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 125);
      pdf.text(`Ventas Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 14, 132);
      pdf.text(`Ventas Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 14, 139);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 146);
      pdf.text(`Cantidad Ventas: ${estadisticas.cantidadVentas}`, 14, 153);

      const filas = estadisticas.ventasPorHora.map(item => [item.hora, `C$ ${item.total}`]);

      autoTable(pdf, {
        startY: 160,
        head: [["Hora", "Monto Acumulado"]],
        body: filas
      });

      const fechaActual = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
      pdf.save(`VentasHora_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF");
    }
  };

  const generarPdfVentasCategoria = async () => {
    try {
      if (!graficoCategoriaRef.current) return;
      const canvas = await html2canvas(graficoCategoriaRef.current, { scale: 2 });
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setFontSize(18);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte de Ventas por Categoría", 14, 15);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 22);

      const imagen = canvas.toDataURL("image/png");
      pdf.addImage(imagen, "PNG", 10, 30, 190, 80);

      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen General", 14, 120);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000000");
      pdf.setFontSize(10);

      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 14, 130);
      pdf.text(`Ventas Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 14, 137);
      pdf.text(`Ventas Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 14, 144);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 14, 151);
      pdf.text(`Cantidad Ventas: ${estadisticas.cantidadVentas}`, 14, 158);

      const filasCategoria = estadisticas.ventasPorCategoria.map(item => [
        item.name,
        `C$ ${item.value.toFixed(2)}`
      ]);

      autoTable(pdf, {
        startY: 170,
        head: [["Categoría", "Monto Vendido"]],
        body: filasCategoria
      });

      const fechaActual = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
      pdf.save(`VentasPorCategoria_${fechaDesde}_${fechaHasta}_Generado_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF de Categorías");
    }
  };

  const generarPdfGeneral = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setFontSize(20);
      pdf.setTextColor("#330775");
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte General de Ventas", 14, 20);

      pdf.setFontSize(11);
      pdf.setTextColor("#000000");
      pdf.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 14, 30);

      pdf.setFontSize(14);
      pdf.setTextColor("#330775");
      pdf.text("Resumen General", 14, 45);

      pdf.setFontSize(11);
      pdf.setTextColor("#000000");
      pdf.text(`Total Ventas: C$ ${estadisticas.totalVentas.toFixed(2)}`, 20, 55);
      pdf.text(`Ventas en Efectivo: C$ ${estadisticas.ventasEfectivo.toFixed(2)}`, 20, 62);
      pdf.text(`Ventas con Tarjeta: C$ ${estadisticas.ventasTarjeta.toFixed(2)}`, 20, 69);
      pdf.text(`Productos Vendidos: ${estadisticas.productosVendidos}`, 20, 76);
      pdf.text(`Cantidad de Ventas: ${estadisticas.cantidadVentas}`, 20, 83);

      if (graficoHoraRef.current) {
        const canvasHora = await html2canvas(graficoHoraRef.current, { scale: 1.5 });
        pdf.addImage(canvasHora.toDataURL("image/png"), "PNG", 10, 95, 190, 70);
      }

      if (graficoCategoriaRef.current) {
        const canvasCat = await html2canvas(graficoCategoriaRef.current, { scale: 1.5 });
        pdf.addImage(canvasCat.toDataURL("image/png"), "PNG", 10, 175, 190, 70);
      }

      const fechaActual = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
      pdf.save(`Reporte_General_${fechaDesde}_${fechaHasta}_${fechaActual}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error generando PDF General");
    }
  };

  const COLORES = ["#5e26b2", "#39ff95", "#ff6bc6", "#8b46ff", "#00d4ff", "#ffd93d"];

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h2>Dashboard</h2>
        <h6>Estadísticas del Negocio</h6>
      </div>

      {/* Seccion de Filtros y Botones Globales */}
      <Row className="mb-4 align-items-end">
        <Col xs={6} md={3}>
          <Form.Group>
            <Form.Label className="fw-bold">Desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={6} md={3}>
          <Form.Group>
            <Form.Label className="fw-bold">Hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={12} md={6} className="d-flex gap-2 mt-3 mt-md-0 justify-content-md-end">
          <Button variant="success" onClick={descargarExcel} disabled={cargando}>
            <i className="bi bi-file-earmark-excel me-2"></i>Descargar Excel
          </Button>
          <Button variant="danger" onClick={generarPdfGeneral} disabled={cargando}>
            <i className="bi bi-file-earmark-pdf me-2"></i>PDF General
          </Button>
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Cargando datos y procesando gráficos...</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de KPI */}
          <Row className="g-4 mb-5">
            <Col md={6} lg={3}>
              <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #28a745, #34ce57)" }}>
                <Card.Body>
                  <h5>Ventas Totales</h5>
                  <h2>C$ {estadisticas.totalVentas.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #0166d3, #3399ff)" }}>
                <Card.Body>
                  <h5>Efectivo</h5>
                  <h2>C$ {estadisticas.ventasEfectivo.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #5ea5f1, #94c0ec)" }}>
                <Card.Body>
                  <h5>Tarjeta</h5>
                  <h2>C$ {estadisticas.ventasTarjeta.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #e27d01, #ffa500)" }}>
                <Card.Body>
                  <h5>Productos Vendidos</h5>
                  <h2>{estadisticas.productosVendidos}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sección de Gráficos */}
          <Row className="g-4">
            {/* Gráfico de Ventas por Hora */}
            <Col lg={8}>
              <Card className="shadow border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Ventas por Hora</h5>
                    <Button variant="outline-danger" size="sm" onClick={generarPdfVentasHora}>
                      <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                    </Button>
                  </div>
                  
                  <div ref={graficoHoraRef} style={{ width: "100%", backgroundColor: "#ffffff" }}>
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart data={estadisticas.ventasPorHora}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis tickFormatter={(v) => `C$${v}`} />
                        <Tooltip formatter={(v) => [`C$ ${v}`, "Monto"]} />
                        <Line type="monotone" dataKey="total" stroke="#5e26b2" strokeWidth={4} dot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Gráfico de Ventas por Categoría */}
            <Col lg={4}>
              <Card className="shadow border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Ventas por Categoría</h5>
                    <Button variant="outline-info" size="sm" onClick={generarPdfVentasCategoria}>
                      <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                    </Button>
                  </div>

                  <div ref={graficoCategoriaRef} style={{ width: "100%", backgroundColor: "#ffffff" }}>
                    <ResponsiveContainer width="100%" height={360}>
                      <PieChart>
                        <Pie
                          data={estadisticas.ventasPorCategoria.length > 0 ? estadisticas.ventasPorCategoria : [{ name: "Sin datos", value: 1 }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={110}
                        >
                          {estadisticas.ventasPorCategoria.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORES[i % COLORES.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `C$ ${v}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Inicio;