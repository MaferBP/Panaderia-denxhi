import { useEffect, useState } from "react";
import axios from "axios";

import "./Productos.css";

const imagenesProductos = [
  { archivo: "Baguette.png", nombre: "Baguette" },
  { archivo: "bijote.png", nombre: "Bijote" },
  { archivo: "Bolillo.png", nombre: "Bolillo" },
  { archivo: "Brioche.png", nombre: "Brioche" },
  { archivo: "cemita.png", nombre: "Cemita" },
  { archivo: "Cheesecake.png", nombre: "Cheesecake" },
  { archivo: "Concha.png", nombre: "Concha" },
  { archivo: "conchaChocolate.png", nombre: "Concha chocolate" },
  { archivo: "conchaFresa.png", nombre: "Concha fresa" },
  { archivo: "cuernito.png", nombre: "Cuernito" },
  { archivo: "Cupcakes.png", nombre: "Cupcakes" },
  { archivo: "Donas.png", nombre: "Donas" },
  { archivo: "Dona_de_azucar.png", nombre: "Dona de azucar" },
  { archivo: "Dona_de_chocolate.png", nombre: "Dona de chocolate" },
  { archivo: "empanadasCajeta.png", nombre: "Empanadas cajeta" },
  { archivo: "mantecada.png", nombre: "Mantecada" },
  { archivo: "orejita.png", nombre: "Orejita" },
  { archivo: "panAvena.png", nombre: "Pan avena" },
  { archivo: "panCajaIntegral.png", nombre: "Pan caja integral" },
  { archivo: "PanLinaza.png", nombre: "Pan linaza" },
  { archivo: "panMolde.png", nombre: "Pan molde" },
  { archivo: "pan_artesano.png", nombre: "Pan artesano" },
  { archivo: "pan_de_queso.png", nombre: "Pan de queso" },
  { archivo: "pan_feria_Fresa.png", nombre: "Pan feria fresa" },
  { archivo: "pan_feria_vainilla.png", nombre: "Pan feria vainilla" },
  { archivo: "Pan_relleno_de_vainilla.png", nombre: "Pan relleno de vainilla" },
  { archivo: "pastelZanahoria.png", nombre: "Pastel zanahoria" },
  { archivo: "Pastel_de_tres_leches.png", nombre: "Pastel de tres leches" },
  { archivo: "RoldeCanela.png", nombre: "Rol de canela" },
];

function Productos({ setPagina }) {

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  const esAdmin = usuario?.rol === "admin";

  const [productos, setProductos] = useState([]);

  const [idEditando, setIdEditando] = useState(null);

  const [nombre, setNombre] = useState("");

  const [descripcion, setDescripcion] = useState("");

  const [precio, setPrecio] = useState("");

  const [stock, setStock] = useState("");

  const [categoria, setCategoria] = useState("");

  const [imagen, setImagen] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // OBTENER PRODUCTOS
  const obtenerProductos = async () => {

    try {

      const respuesta = await axios.get(
        "/productos",
        {
          params: {
            buscar: busqueda || undefined,
            categoria: categoriaFiltro || undefined
          }
        }
      );

      setProductos(respuesta.data);

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.detail ||
        "Error al eliminar producto"
      );

    }

  };

  // GUARDAR
  const guardarProducto = async (e) => {

    e.preventDefault();

    if (!esAdmin) {

      alert("Solo el administrador puede guardar productos");

      return;

    }

    const producto = {

      nombre,

      descripcion,

      precio: parseFloat(precio),

      stock: parseInt(stock),

      categoria,

      imagen

    };

    try {

      if (idEditando) {

        await axios.put(
          `/productos/${idEditando}`,
          producto
        );

        alert("Producto actualizado");

      } else {

        await axios.post(
          "/productos",
          producto
        );

        alert("Producto agregado");

      }

      limpiarFormulario();

      obtenerProductos();

    } catch (error) {

      console.log(error);

      alert("Error al guardar");

    }

  };

  // EDITAR
  const editarProducto = (producto) => {

    if (!esAdmin) {

      return;

    }

    setIdEditando(producto.id_producto);

    setNombre(producto.nombre);

    setDescripcion(producto.descripcion);

    setPrecio(producto.precio);

    setStock(producto.stock);

    setCategoria(producto.categoria);

    setImagen(producto.imagen);

  };

  // ELIMINAR
  const eliminarProducto = async (id) => {

    if (!esAdmin) {

      alert("Solo el administrador puede eliminar productos");

      return;

    }

    const confirmar = window.confirm(
      "¿Eliminar producto?"
    );

    if (!confirmar) return;

    try {

      await axios.delete(
        `/productos/${id}`
      );

      obtenerProductos();

    } catch (error) {

      console.log(error);

    }

  };

  // LIMPIAR
  const limpiarFormulario = () => {

    setIdEditando(null);

    setNombre("");

    setDescripcion("");

    setPrecio("");

    setStock("");

    setCategoria("");

    setImagen("");

  };

  useEffect(() => {

    obtenerProductos();

  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      obtenerProductos();
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busqueda, categoriaFiltro]);

  return (

    <div className="productos-container">

      {/* HEADER */}

      <div className="productos-header">

        <h1>
          Productos
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

      {esAdmin && (
      <form
        className="form-producto"
        onSubmit={guardarProducto}
      >

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          required
        />

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
          required
        />

        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) =>
            setPrecio(e.target.value)
          }
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value)
          }
          required
        />

        <select
          value={categoria}
          onChange={(e) =>
            setCategoria(e.target.value)
          }
          required
        >

          <option value="">
            Selecciona categoria
          </option>

          <option value="Pan dulce">
            Pan dulce
          </option>

          <option value="Pan salado">
            Pan salado
          </option>

          <option value="Pan artesanal">
            Pan artesanal
          </option>

          <option value="Pan relleno">
            Pan relleno
          </option>

          <option value="Donas">
            Donas
          </option>

          <option value="Pasteles">
            Pasteles
          </option>

          <option value="Pan integral">
            Pan integral
          </option>

        </select>

        {/* IMAGEN SECCION */}
        <div className="imagen-seccion">
          <label>Selecciona la imagen:</label>
          <select
            value={imagen}
            onChange={(e) =>
              setImagen(e.target.value)
            }
            required
          >
            <option value="">
              Elige una imagen
            </option>

            {imagenesProductos.map((item) => (
              <option
                key={item.archivo}
                value={item.archivo}
              >
                {item.nombre}
              </option>
            ))}
          </select>

          {imagen && (
            <div className="preview-container">
              <img
                src={`/productos/${imagen}`}
                alt="preview"
                className="preview-img"
              />
            </div>
          )}
        </div>

        <button type="submit">
          {
            idEditando
            ?
            "Actualizar producto"
            :
            "Agregar producto"
          }
        </button>
      </form>
      )}

      {/* CATALOGO */}

      <div className="buscador-productos">
        <input
          type="search"
          placeholder="Buscar producto"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <select
          value={categoriaFiltro}
          onChange={(e) =>
            setCategoriaFiltro(e.target.value)
          }
        >
          <option value="">
            Todas las categorias
          </option>

          <option value="Pan dulce">
            Pan dulce
          </option>

          <option value="Pan salado">
            Pan salado
          </option>

          <option value="Pan artesanal">
            Pan artesanal
          </option>

          <option value="Pan relleno">
            Pan relleno
          </option>

          <option value="Donas">
            Donas
          </option>

          <option value="Pasteles">
            Pasteles
          </option>

          <option value="Pan integral">
            Pan integral
          </option>
        </select>
      </div>

      <div className="catalogo-grid">

        {
          productos.map((producto) => (

            <div
              key={producto.id_producto}
              className="producto-card"
            >

              <img
                src={`/productos/${producto.imagen}`}
                alt={producto.nombre}
              />

              <h3>
                {producto.nombre}
              </h3>

              <p>
                {producto.descripcion}
              </p>

              <span>
                ${producto.precio}
              </span>

              <small>
                Stock:
                {" "}
                {producto.stock}
              </small>

              {esAdmin && (
              <div className="acciones-producto">

                <button
                  className="btn-editar"
                  onClick={() =>
                    editarProducto(producto)
                  }
                >
                  Editar
                </button>

                <button
                  className="btn-eliminar"
                  onClick={() =>
                    eliminarProducto(
                      producto.id_producto
                    )
                  }
                >
                  Eliminar
                </button>

              </div>
              )}

            </div>

          ))
        }

      </div>

    </div>

  );

}

export default Productos;
