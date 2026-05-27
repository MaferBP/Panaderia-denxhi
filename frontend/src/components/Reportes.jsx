import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./Reportes.css";

function Reportes({ setPagina }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ventas, setVentas] = useState([]);

  const buscarVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas");
      return;
    }

    const respuesta = await axios.get("http://192.168.1.28:8000/ventas-fecha", {
      params: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    });

    setVentas(respuesta.data);
  };

  const totalVendido = ventas.reduce(
    (total, venta) => total + parseFloat(venta.total),
    0
  );

  const descargarPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // ENCABEZADO
    pdf.setFillColor(30, 58, 95);
    pdf.rect(0, 0, 210, 42, "F");

    // LOGO
    pdf.addImage(logo, "PNG", 15, 6, 32, 32);

    // TITULO
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text("Panadería Denxhi", 110, 18, null, null, "center");

    pdf.setFontSize(12);
    pdf.text("Reporte de ventas por fecha", 110, 29, null, null, "center");

    // RESUMEN
    pdf.setTextColor(30, 58, 95);
    pdf.setFontSize(14);
    pdf.text("Resumen del reporte", 14, 58);

    pdf.setFillColor(240, 249, 252);
    pdf.roundedRect(14, 65, 85, 25, 4, 4, "F");
    pdf.roundedRect(110, 65, 85, 25, 4, 4, "F");
    pdf.roundedRect(14, 98, 85, 25, 4, 4, "F");
    pdf.roundedRect(110, 98, 85, 25, 4, 4, "F");

    pdf.setFontSize(10);
    pdf.setTextColor(75, 85, 99);

    pdf.text("Fecha inicial", 20, 74);
    pdf.text("Fecha final", 116, 74);
    pdf.text("Total vendido", 20, 107);
    pdf.text("Ventas encontradas", 116, 107);

    pdf.setFontSize(13);
    pdf.setTextColor(30, 58, 95);

    pdf.text(fechaInicio || "Sin seleccionar", 20, 84);
    pdf.text(fechaFin || "Sin seleccionar", 116, 84);
    pdf.text(`$${totalVendido.toFixed(2)}`, 20, 117);
    pdf.text(`${ventas.length}`, 116, 117);

    // TABLA
    autoTable(pdf, {
      startY: 138,
      head: [["Pedido", "Cliente", "Total", "Fecha"]],
      body: ventas.map((venta) => [
        venta.id_pedido,
        venta.cliente,
        `$${venta.total}`,
        venta.fecha,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        halign: "center",
      },
      bodyStyles: {
        textColor: [60, 60, 60],
      },
      alternateRowStyles: {
        fillColor: [240, 249, 252],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { halign: "center" },
        2: { halign: "right" },
      },
    });

    // FOOTER
    const pageHeight = pdf.internal.pageSize.height;

    pdf.setFillColor(30, 58, 95);
    pdf.rect(0, pageHeight - 18, 210, 18, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(
      "Sistema administrativo Panadería Denxhi",
      105,
      pageHeight - 8,
      null,
      null,
      "center"
    );

    pdf.save("reporte-ventas-panaderia-denxhi.pdf");
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1>Reportes de ventas</h1>

        <button onClick={() => setPagina("dashboard")}>
          Volver
        </button>
      </div>

      <div className="filtros-reportes">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <button onClick={buscarVentas}>
          Buscar ventas
        </button>

        <button onClick={descargarPDF}>
          Descargar PDF
        </button>
      </div>

      <div className="reporte-box">
        <p>Resumen del cierre de caja para un día específico</p>

        <h2>Panadería Denxhi</h2>
        <p>Reporte de ventas por fecha</p>

        <div className="resumen-reporte">
          <div>
            <span>Fecha inicial</span>
            <strong>{fechaInicio || "Sin seleccionar"}</strong>
          </div>

          <div>
            <span>Fecha final</span>
            <strong>{fechaFin || "Sin seleccionar"}</strong>
          </div>

          <div>
            <span>Total vendido</span>
            <strong>${totalVendido.toFixed(2)}</strong>
          </div>

          <div>
            <span>Ventas encontradas</span>
            <strong>{ventas.length}</strong>
          </div>
        </div>

        <div className="grafica-reporte">
          <h2>Ventas por fecha</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ventas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="#0096c7"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="tabla-reportes-contenedor">
          <table className="tabla-reportes">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id_pedido}>
                  <td>{venta.id_pedido}</td>
                  <td>{venta.cliente}</td>
                  <td>${venta.total}</td>
                  <td>{venta.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reportes;
