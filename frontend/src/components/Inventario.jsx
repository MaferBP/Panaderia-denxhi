import { useEffect, useState } from "react";
import axios from "axios";
import "./Inventario.css";

function Inventario({ setPagina }) {

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  const [productos, setProductos] = useState([]);

  const [mermas, setMermas] = useState([]);

  const [entradas, setEntradas] = useState([]);

  const [idProducto, setIdProducto] = useState("");

  const [tipoMovimiento, setTipoMovimiento] =
    useState("Entrada");

  const [cantidad, setCantidad] = useState("");

  const [motivo, setMotivo] = useState("");

  // PRODUCTOS
  const obtenerProductos = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/productos"
      );

      setProductos(respuesta.data);

    } catch (error) {

      console.error(error);

    }

  };

  // MERMAS
  const obtenerMermas = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/mermas"
      );

      setMermas(respuesta.data);

    } catch (error) {

      console.error(error);

    }

  };

  // ENTRADAS
  const obtenerEntradas = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/entradas"
      );

      setEntradas(respuesta.data);

    } catch (error) {

      console.error(error);

    }

  };

  // REGISTRAR
  const registrarMovimiento = async (e) => {

    e.preventDefault();

    try {

      const respuesta = await axios.post(
        "http://192.168.1.28:8000/inventario",
        {

          id_producto: Number(idProducto),

          tipo_movimiento: tipoMovimiento,

          cantidad: Number(cantidad),

          motivo:
            tipoMovimiento === "Merma"
            ?
            motivo
            :
            null,

          id_usuario: usuario.id_usuario

        }
      );

      alert(respuesta.data.mensaje);

      setIdProducto("");

      setTipoMovimiento("Entrada");

      setCantidad("");

      setMotivo("");

      obtenerProductos();

      obtenerMermas();

      obtenerEntradas();

    } catch (error) {

      console.log(error);

      alert("Error al registrar movimiento");

    }

  };

  useEffect(() => {

    obtenerProductos();

    obtenerMermas();

    obtenerEntradas();

  }, []);

  return (

    <div className="inventario-container">

      {/* HEADER */}

      <div className="inventario-header">

        <h1>
          Inventario
        </h1>

        <button
          onClick={() =>
            setPagina("dashboard")
          }
        >
          Volver
        </button>

      </div>

      {/* FORM */}

      <form
        className="form-inventario"
        onSubmit={registrarMovimiento}
      >

        {/* PRODUCTO */}

        <select
          value={idProducto}
          onChange={(e) =>
            setIdProducto(e.target.value)
          }
          required
        >

          <option value="">
            Selecciona un producto
          </option>

          {
            productos.map((producto) => (

              <option
                key={producto.id_producto}
                value={producto.id_producto}
              >

                {producto.nombre}

              </option>

            ))
          }

        </select>

        {/* MOVIMIENTO */}

        <select
          value={tipoMovimiento}
          onChange={(e) =>
            setTipoMovimiento(e.target.value)
          }
          required
        >

          <option value="Entrada">
            Entrada
          </option>

          <option value="Merma">
            Merma
          </option>

        </select>

        {/* CANTIDAD */}

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) =>
            setCantidad(e.target.value)
          }
          min="1"
          required
        />

        {/* MOTIVO */}

        {
          tipoMovimiento === "Merma"
          &&
          <input
            type="text"
            placeholder="Motivo de la merma"
            value={motivo}
            onChange={(e) =>
              setMotivo(e.target.value)
            }
            required
          />
        }

        <button type="submit">
          Registrar movimiento
        </button>

      </form>

      {/* INVENTARIO */}

      {false && (
      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>

          </tr>

        </thead>

        <tbody>

          {
            movimientos.length > 0
            ?
            movimientos.map((producto) => (

              <tr key={producto.id_producto}>

                <td>
                  {producto.id_producto}
                </td>

                <td>
                  {producto.nombre}
                </td>

                <td>
                  {producto.descripcion}
                </td>

                <td>
                  ${producto.precio}
                </td>

                <td>

                  {
                    producto.stock > 10
                    ?
                    <span style={{ color: "green" }}>
                      {producto.stock}
                    </span>
                    :
                    producto.stock > 5
                    ?
                    <span style={{ color: "orange" }}>
                      {producto.stock}
                    </span>
                    :
                    <span style={{ color: "red" }}>
                      {producto.stock}
                    </span>
                  }

                </td>

                <td>
                  {producto.categoria}
                </td>

              </tr>

            ))
            :
            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >

                No hay productos

              </td>

            </tr>
          }

        </tbody>

      </table>
      )}

      {/* ENTRADAS */}

      <div className="tabla-mermas tabla-entradas">

        <h2>
          Historial de entradas
        </h2>

        <table className="tabla-entradas-inventario">

          <thead>

            <tr>

              <th>ID</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Usuario</th>
              <th>Fecha</th>

            </tr>

          </thead>

          <tbody>

            {
              entradas.map((entrada) => (

                <tr key={entrada.id_entrada}>

                  <td>
                    {entrada.id_entrada}
                  </td>

                  <td>
                    {entrada.producto}
                  </td>

                  <td>
                    {entrada.cantidad}
                  </td>

                  <td>
                    {entrada.usuario}
                  </td>

                  <td>
                    {entrada.fecha}
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

      {/* MERMAS */}

      <div className="tabla-mermas tabla-mermas-ajustada">

        <h2>
          Historial de mermas
        </h2>

        <table className="tabla-mermas-inventario">

          <thead>

            <tr>

              <th>ID</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Fecha</th>

            </tr>

          </thead>

          <tbody>

            {
              mermas.map((merma) => (

                <tr key={merma.id_merma}>

                  <td>
                    {merma.id_merma}
                  </td>

                  <td>
                    {merma.producto}
                  </td>

                  <td>
                    {merma.cantidad}
                  </td>

                  <td>
                    {merma.motivo}
                  </td>

                  <td>
                    {merma.usuario}
                  </td>

                  <td>
                    {merma.fecha}
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default Inventario;
