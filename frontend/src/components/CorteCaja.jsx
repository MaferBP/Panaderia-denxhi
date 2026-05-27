import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

import "./CorteCaja.css";

function CorteCaja({ setPagina }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [fecha, setFecha] = useState("");
  const [datos, setDatos] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [historial, setHistorial] = useState([]);

  const obtenerCorte = async () => {
    if (!fecha) {
      alert("Selecciona una fecha");
      return;
    }

    try {
      const respuesta = await axios.get("http://192.168.1.28:8000/corte-caja", {
        params: { fecha },
      });

      setDatos(respuesta.data);
    } catch (error) {
      console.log(error);
      alert("Error al obtener corte");
    }
  };

  const guardarCorte = async () => {
    if (!datos) {
      alert("Primero genera el corte");
      return;
    }

    try {
      await axios.post("http://192.168.1.28:8000/cortes-caja", {
        fecha_corte: fecha,
        id_usuario: usuario.id_usuario,
        total_pedidos: datos.resumen.total_pedidos,
        total_vendido: datos.resumen.total_vendido,
        total_efectivo: datos.resumen.total_efectivo,
        total_tarjeta: datos.resumen.total_tarjeta,
        total_transferencia: datos.resumen.total_transferencia,
        efectivo_recibido: datos.resumen.efectivo_recibido,
        cambio_entregado: datos.resumen.cambio_entregado,
        total_real_caja:
          datos.resumen.total_efectivo - datos.resumen.cambio_entregado,
        observaciones,
      });

      alert("Corte guardado correctamente");
      obtenerHistorial();
    } catch (error) {
      console.log(error);
      alert("Error al guardar corte");
    }
  };

  const descargarPDF = () => {
    if (!datos) {
      alert("Genera el corte primero");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const agregarFooter = () => {
      const pageHeight = pdf.internal.pageSize.height;

      pdf.setFillColor(30, 58, 95);
      pdf.rect(0, pageHeight - 18, 210, 18, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(
        "Sistema administrativo Panaderia Denxhi",
        105,
        pageHeight - 8,
        null,
        null,
        "center"
      );
    };

    pdf.setFillColor(30, 58, 95);
    pdf.rect(0, 0, 210, 40, "F");

    pdf.addImage(logo, "PNG", 15, 5, 30, 30);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text("Panadería Denxhi", 105, 17, null, null, "center");

    pdf.setFontSize(12);
    pdf.text("Corte de caja", 105, 27, null, null, "center");

    pdf.setTextColor(30, 58, 95);
    pdf.setFontSize(14);
    pdf.text(`Fecha: ${fecha}`, 14, 55);

    pdf.setFontSize(12);
    pdf.text(
      `Total vendido: $${Number(datos.resumen.total_vendido).toFixed(2)}`,
      14,
      70
    );
    pdf.text(
      `Efectivo: $${Number(datos.resumen.total_efectivo).toFixed(2)}`,
      14,
      80
    );
    pdf.text(
      `Tarjeta: $${Number(datos.resumen.total_tarjeta).toFixed(2)}`,
      14,
      90
    );
    pdf.text(
      `Transferencia: $${Number(datos.resumen.total_transferencia).toFixed(2)}`,
      14,
      100
    );
    pdf.text(
      `Cambio entregado: $${Number(datos.resumen.cambio_entregado).toFixed(2)}`,
      14,
      110
    );
    pdf.text(`Total pedidos: ${datos.resumen.total_pedidos}`, 14, 120);

    autoTable(pdf, {
      startY: 135,
      head: [["ID", "Cliente", "Empleado", "Pago", "Total"]],
      body: datos.pedidos.map((pedido) => [
        pedido.id_pedido,
        pedido.cliente,
        pedido.empleado,
        pedido.tipo_pago,
        `$${pedido.total}`,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [240, 249, 252],
      },
      bodyStyles: {
        textColor: [75, 85, 99],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      margin: {
        bottom: 26,
      },
      didDrawPage: agregarFooter,
    });

    let finalY = pdf.lastAutoTable.finalY + 15;
    const pageHeight = pdf.internal.pageSize.height;

    if (finalY + 50 > pageHeight - 22) {
      pdf.addPage();
      finalY = 25;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(30, 58, 95);
    pdf.text("Observaciones:", 14, finalY);

    pdf.setFontSize(11);
    pdf.text(observaciones || "Sin observaciones", 14, finalY + 10);

    pdf.line(140, finalY + 35, 195, finalY + 35);
    pdf.text("Firma administrador", 150, finalY + 42);

    const footerPageHeight = pdf.internal.pageSize.height;

    pdf.setFillColor(30, 58, 95);
    pdf.rect(0, footerPageHeight - 18, 210, 18, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(
      "Sistema administrativo Panadería Denxhi",
      105,
      footerPageHeight - 8,
      null,
      null,
      "center"
    );

    pdf.save(`corte-caja-${fecha}.pdf`);
  };

  const obtenerHistorial = async () => {
    try {
      const respuesta = await axios.get("http://192.168.1.28:8000/cortes-caja");
      setHistorial(respuesta.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  return (
    <div className="corte-container">
      <div className="corte-header">
        <h1>Corte de caja</h1>

        <button onClick={() => setPagina("dashboard")}>
          Volver
        </button>
      </div>

      <div className="corte-filtro">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <button onClick={obtenerCorte}>
          Generar corte
        </button>
      </div>

      {datos && (
        <>
          <div className="corte-cards">
            <div className="corte-card">
              <h3>Total vendido</h3>
              <p>${Number(datos.resumen.total_vendido).toFixed(2)}</p>
            </div>

            <div className="corte-card">
              <h3>Efectivo</h3>
              <p>${Number(datos.resumen.total_efectivo).toFixed(2)}</p>
            </div>

            <div className="corte-card">
              <h3>Tarjeta</h3>
              <p>${Number(datos.resumen.total_tarjeta).toFixed(2)}</p>
            </div>

            <div className="corte-card">
              <h3>Transferencia</h3>
              <p>${Number(datos.resumen.total_transferencia).toFixed(2)}</p>
            </div>

            <div className="corte-card">
              <h3>Cambio entregado</h3>
              <p>${Number(datos.resumen.cambio_entregado).toFixed(2)}</p>
            </div>

            <div className="corte-card">
              <h3>Total pedidos</h3>
              <p>{datos.resumen.total_pedidos}</p>
            </div>
          </div>

          <div className="observaciones-box">
            <h2>Observaciones</h2>

            <textarea
              placeholder="Notas del corte..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />

            <button onClick={guardarCorte}>
              Guardar corte
            </button>

            <button onClick={descargarPDF}>
              Descargar PDF
            </button>
          </div>

          <div className="tabla-corte">
            <h2>Ventas del día</h2>

            <div className="tabla-ventas-contenedor">
              <table className="tabla-ventas-dia">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Empleado</th>
                    <th>Pago</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {datos.pedidos.map((pedido) => (
                    <tr key={pedido.id_pedido}>
                      <td>{pedido.id_pedido}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.empleado}</td>
                      <td>{pedido.tipo_pago}</td>
                      <td>${pedido.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="tabla-corte historial-box">
        <h2>Historial de cortes</h2>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Total vendido</th>
              <th>Total pedidos</th>
              <th>Observaciones</th>
            </tr>
          </thead>

          <tbody>
            {historial.map((corte) => (
              <tr key={corte.id_corte}>
                <td>{corte.fecha_corte}</td>
                <td>{corte.usuario}</td>
                <td>${corte.total_vendido}</td>
                <td>{corte.total_pedidos}</td>
                <td>{corte.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CorteCaja;
