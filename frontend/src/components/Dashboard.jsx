import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

import "./Dashboard.css";
import logo from "../assets/logo.png";

function Dashboard({ setPagina }) {

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  const [estadisticas, setEstadisticas] = useState({
    productos: 0,
    usuarios: 0,
    inventario: 0,
    pedidos: 0
  });

  const [graficaVentas, setGraficaVentas] = useState([]);

  const [stockBajo, setStockBajo] = useState([]);

  const [productosVendidos, setProductosVendidos] = useState([]);

  const [ventasEmpleado, setVentasEmpleado] = useState([]);

  const colores = [
    "#1e3a5f",
    "#0096c7",
    "#38bdf8",
    "#2563eb",
    "#60a5fa",
    "#0f766e"
  ];

  // ESTADISTICAS
  const obtenerEstadisticas = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/estadisticas"
      );

      setEstadisticas(respuesta.data);

    } catch (error) {

      console.log(error);

    }

  };

  // PEDIDOS
  const obtenerPedidos = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/pedidos"
      );

      const pedidos = respuesta.data;

      const datosGrafica = pedidos.map((pedido) => ({

        pedido: `#${pedido.id_pedido}`,

        cliente: pedido.cliente,

        total: parseFloat(pedido.total)

      }));

      setGraficaVentas(datosGrafica);

    } catch (error) {

      console.log(error);

    }

  };

  // EMPLEADO
  const obtenerVentasEmpleado = async () => {

    try {

      const respuesta = await axios.get(
        `http://192.168.1.28:8000/ventas-empleado/${usuario.id_usuario}`
      );

      setVentasEmpleado(respuesta.data);

    } catch (error) {

      console.log(error);

    }

  };

  // STOCK BAJO
  const obtenerStockBajo = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/stock-bajo"
      );

      setStockBajo(respuesta.data);

    } catch (error) {

      console.log(error);

    }

  };

  // PRODUCTOS MAS VENDIDOS
  const obtenerProductosVendidos = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/productos-mas-vendidos"
      );

      const productos = respuesta.data.map((item) => ({
        name: item.nombre,
        value: parseInt(item.total_vendido)
      }));

      setProductosVendidos(productos);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    obtenerEstadisticas();

    obtenerPedidos();

    obtenerStockBajo();

    obtenerProductosVendidos();

    obtenerVentasEmpleado();

  }, []);

  // TOTAL GENERAL
  const totalVentas = graficaVentas.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // TOTAL EMPLEADO
  const totalEmpleado = ventasEmpleado.reduce(
    (acc, item) =>
      acc + parseFloat(item.total),
    0
  );

  // LOGOUT
  const cerrarSesion = () => {

    const confirmar = window.confirm(
      "¿Deseas cerrar sesión?"
    );

    if (!confirmar) return;

    localStorage.removeItem("usuario");

    window.location.reload();

  };

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <img
          src={logo}
          alt="Logo"
          className="sidebar-logo"
        />

        <nav>

          <a
            href="#"
            onClick={() => setPagina("dashboard")}
          >
            Inicio
          </a>

          <a
            href="#"
            onClick={() => setPagina("productos")}
          >
            Productos
          </a>

          <a
            href="#"
            onClick={() => setPagina("inventario")}
          >
            Inventario
          </a>

          <a
            href="#"
            onClick={() => setPagina("pedidos")}
          >
            Pedidos
          </a>

          {
            usuario?.rol === "admin"
            &&
            <a
              href="#"
              onClick={() => setPagina("usuarios")}
            >
              Usuarios
            </a>
          }

          {
            usuario?.rol === "admin"
            &&
            <a
              href="#"
              onClick={() => setPagina("reportes")}
            >
              Reportes
            </a>
          }

          {
            usuario?.rol === "admin"
            &&
            <a
              href="#"
              onClick={() => setPagina("corteCaja")}
            >
              Corte de caja
            </a>
          }

        </nav>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <h1>
              Panel de Control
            </h1>

            <p>
              Bienvenido,
              {" "}
              {usuario?.nombre}
            </p>

          </div>

          <button
            className="logout-btn"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </header>

        {/* ADMIN */}

        {
          usuario?.rol === "admin"
          &&
          <>
            <section className="cards">

              <div className="card">
                <h3>Productos</h3>
                <p>{estadisticas.productos}</p>
              </div>

              <div className="card">
                <h3>Inventario</h3>
                <p>{estadisticas.inventario}</p>
              </div>

              <div className="card">
                <h3>Pedidos</h3>
                <p>{graficaVentas.length}</p>
              </div>

              <div className="card">
                <h3>Usuarios</h3>
                <p>{estadisticas.usuarios}</p>
              </div>

            </section>

            <section className="cards">

              <div className="card extra-card">
                <h3>Total vendido</h3>
                <p>
                  ${totalVentas.toFixed(2)}
                </p>
              </div>

            </section>

            {/* ALERTAS */}

            <section className="alertas-box">

              <h2>
                ⚠ Productos con stock bajo
              </h2>

              {
                stockBajo.length === 0
                ?
                <p className="sin-alertas">
                  Todo el inventario está estable
                </p>
                :
                stockBajo.map((producto) => (

                  <div
                    key={producto.id_producto}
                    className="alerta-item"
                  >

                    <span>
                      {producto.nombre}
                    </span>

                    <strong>
                      Stock:
                      {" "}
                      {producto.stock}
                    </strong>

                  </div>

                ))
              }

            </section>

            {/* GRAFICAS */}

            <section className="graficas-grid">

              <div className="grafica-box">

                <h2>
                  Ventas registradas
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <BarChart data={graficaVentas}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="pedido" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="total"
                      radius={[10, 10, 0, 0]}
                    >

                      {
                        graficaVentas.map((_, index) => (

                          <Cell
                            key={index}
                            fill={
                              colores[
                                index % colores.length
                              ]
                            }
                          />

                        ))
                      }

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

              {/* PIE */}

              <div className="grafica-box">

                <h2>
                  Productos más vendidos
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <PieChart>

                    <Pie
                      data={productosVendidos}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={120}
                      label
                    >

                      {
                        productosVendidos.map((_, index) => (

                          <Cell
                            key={index}
                            fill={
                              colores[
                                index % colores.length
                              ]
                            }
                          />

                        ))
                      }

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </section>
          </>
        }

        {/* EMPLEADO */}

        {
          usuario?.rol === "empleado"
          &&
          <>
            <section className="cards">

              <div className="card">
                <h3>Mis pedidos</h3>
                <p>
                  {ventasEmpleado.length}
                </p>
              </div>

              <div className="card">
                <h3>Mis ventas</h3>
                <p>
                  ${totalEmpleado.toFixed(2)}
                </p>
              </div>

              <div className="card">
                <h3>Productos</h3>
                <p>
                  {estadisticas.productos}
                </p>
              </div>

            </section>

            <section className="grafica-box">

              <h2>
                Mis ventas registradas
              </h2>

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <BarChart data={ventasEmpleado}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="id_pedido" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="total"
                    fill="#0096c7"
                    radius={[10, 10, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </section>
          </>
        }

        {/* WELCOME */}

        <section className="welcome-box">

          <h2>
            Panadería Denxhi
          </h2>

          <p>
            Sistema administrativo y de ventas
            desarrollado con React,
            FastAPI y MySQL.
          </p>

        </section>

      </main>

    </div>

  );

}

export default Dashboard;
