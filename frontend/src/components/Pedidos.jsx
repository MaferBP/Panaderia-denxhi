import { useEffect, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./Pedidos.css";

function Pedidos({ setPagina }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [carrito, setCarrito] = useState([]);
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cliente, setCliente] = useState("");

  const [tipoPago, setTipoPago] = useState("Efectivo");
  const [efectivoRecibido, setEfectivoRecibido] = useState("");

  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const ticketRef = useRef();

  const obtenerProductos = async () => {
    try {
      const respuesta = await axios.get("/productos");

      console.log("Productos cargados:", respuesta.data);

      setProductos(respuesta.data);
    } catch (error) {
      console.log("Error al cargar productos:", error);
      alert("No se pudieron cargar los productos");
    }
  };

  const obtenerPedidos = async () => {
    try {
      const respuesta = await axios.get("/pedidos");
      setPedidos(respuesta.data);
    } catch (error) {
      console.log("Error al cargar pedidos:", error);
    }
  };

  const agregarAlCarrito = () => {
    const producto = productos.find(
      (p) => p.id_producto === parseInt(idProducto)
    );

    if (!producto) {
      alert("Selecciona un producto");
      return;
    }

    const cantidadNumero = parseInt(cantidad);

    if (cantidadNumero <= 0 || isNaN(cantidadNumero)) {
      alert("Ingresa una cantidad válida");
      return;
    }

    if (cantidadNumero > producto.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    const subtotal = Number(producto.precio) * cantidadNumero;

    setCarrito([
      ...carrito,
      {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad: cantidadNumero,
        subtotal,
      },
    ]);

    setIdProducto("");
    setCantidad(1);
  };

  const eliminarProducto = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const cambio =
    tipoPago === "Efectivo"
      ? parseFloat(efectivoRecibido || 0) - total
      : 0;

  const registrarPedido = async () => {
    if (carrito.length === 0) {
      alert("Agrega productos");
      return;
    }

    if (tipoPago === "Efectivo" && parseFloat(efectivoRecibido || 0) < total) {
      alert("El efectivo es insuficiente");
      return;
    }

    const productosEnviar = carrito.map((item) => ({
      id_producto: item.id_producto,
      cantidad: item.cantidad,
    }));

    try {
      const respuesta = await axios.post("/pedidos", {
        cliente: cliente || "Cliente general",
        total,
        tipo_pago: tipoPago,
        efectivo_recibido:
          tipoPago === "Efectivo" ? parseFloat(efectivoRecibido) : 0,
        cambio: tipoPago === "Efectivo" ? cambio : 0,
        id_usuario: usuario.id_usuario,
        productos: productosEnviar,
      });

      alert(respuesta.data.mensaje);

      setTicketData({
        cliente: cliente || "Cliente general",
        productos: carrito,
        total,
        tipoPago,
        efectivoRecibido: tipoPago === "Efectivo" ? efectivoRecibido : 0,
        cambio: tipoPago === "Efectivo" ? cambio : 0,
        empleado: usuario.nombre,
        fecha: new Date().toLocaleString(),
      });

      setMostrarTicket(true);

      obtenerPedidos();
      obtenerProductos();
    } catch (error) {
      console.log(error);
      alert("Error al registrar pedido");
    }
  };

  const descargarPDF = async () => {
    const ticket = ticketRef.current;

    const canvas = await html2canvas(ticket);
    const imagen = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const ancho = 80;
    const alto = (canvas.height * ancho) / canvas.width;

    pdf.addImage(imagen, "PNG", 65, 10, ancho, alto);
    pdf.save("ticket-panaderia-denxhi.pdf");
  };

  const nuevaVenta = () => {
    setCarrito([]);
    setCliente("");
    setTipoPago("Efectivo");
    setEfectivoRecibido("");
    setMostrarTicket(false);
    setTicketData(null);

    obtenerProductos();
    obtenerPedidos();
  };

  useEffect(() => {
    obtenerProductos();
    obtenerPedidos();
  }, []);

  if (mostrarTicket && ticketData) {
    return (
      <div className="pedidos-container ticket-pantalla">
        <div className="pedidos-header">
          <h1>Ticket generado</h1>

          <button onClick={() => setPagina("dashboard")}>
            Volver
          </button>
        </div>

        <div className="ticket-section">
          <div className="ticket" ref={ticketRef}>
            <h2>Panadería Denxhi</h2>
            <p>Ticket de compra</p>

            <hr />

            <p>
              <strong>Cliente:</strong> {ticketData.cliente}
            </p>

            <p>
              <strong>Empleado:</strong> {ticketData.empleado}
            </p>

            <p>
              <strong>Fecha:</strong> {ticketData.fecha}
            </p>

            <p>
              <strong>Pago:</strong> {ticketData.tipoPago}
            </p>

            <hr />

            {ticketData.productos.map((item, index) => (
              <div className="ticket-item" key={index}>
                <p>{item.nombre}</p>
                <p>
                  {item.cantidad} x ${item.precio} = $
                  {item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}

            <hr />

            <h3>Total: ${ticketData.total.toFixed(2)}</h3>

            {ticketData.tipoPago === "Efectivo" && (
              <>
                <p>
                  <strong>Efectivo:</strong> ${ticketData.efectivoRecibido}
                </p>

                <p>
                  <strong>Cambio:</strong> ${ticketData.cambio.toFixed(2)}
                </p>
              </>
            )}

            <p className="gracias">
              Gracias por su compra
            </p>
          </div>

          <div className="ticket-buttons">
            <button onClick={descargarPDF}>
              Descargar PDF
            </button>

            <button onClick={nuevaVenta}>
              Nueva venta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h1>Pedidos / Ventas</h1>

        <button onClick={() => setPagina("dashboard")}>
          Volver
        </button>
      </div>

      <div className="pedido-form">
        <input
          type="text"
          placeholder="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />

        <select
          value={idProducto}
          onChange={(e) => setIdProducto(e.target.value)}
        >
          <option value="">Selecciona producto</option>

          {productos.length === 0 ? (
            <option disabled>No hay productos disponibles</option>
          ) : (
            productos.map((producto) => (
              <option key={producto.id_producto} value={producto.id_producto}>
                {producto.nombre} - ${producto.precio} | Stock: {producto.stock}
              </option>
            ))
          )}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />

        <button onClick={agregarAlCarrito}>
          Agregar
        </button>
      </div>

      <div className="carrito-tabla-contenedor">
        <table className="carrito-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {carrito.map((item, index) => (
            <tr key={index}>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td>${item.precio}</td>
              <td>${item.subtotal.toFixed(2)}</td>
              <td>
                <button
                  className="btn-eliminar"
                  onClick={() => eliminarProducto(index)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <div className="pago-box">
        <h2>Información de pago</h2>

        <select
          value={tipoPago}
          onChange={(e) => {
            setTipoPago(e.target.value);
            setEfectivoRecibido("");
          }}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        {tipoPago === "Efectivo" && (
          <input
            type="number"
            placeholder="Efectivo recibido"
            value={efectivoRecibido}
            onChange={(e) => setEfectivoRecibido(e.target.value)}
          />
        )}

        <div className="totales-box">
          <h3>Total: ${total.toFixed(2)}</h3>

          {tipoPago === "Efectivo" && (
            <h3>
              Cambio: ${cambio > 0 ? cambio.toFixed(2) : "0.00"}
            </h3>
          )}
        </div>

        <button className="btn-registrar" onClick={registrarPedido}>
          Registrar pedido
        </button>
      </div>

      <div className="historial-box">
        <h2>Historial de pedidos</h2>

        <div className="historial-pedidos-contenedor">
          <table className="historial-pedidos-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Empleado</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id_pedido}>
                  <td>{pedido.id_pedido}</td>
                  <td>{pedido.cliente}</td>
                  <td>{pedido.empleado || "Sin asignar"}</td>
                  <td>{pedido.tipo_pago}</td>
                  <td>${pedido.total}</td>
                  <td>{pedido.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Pedidos;
