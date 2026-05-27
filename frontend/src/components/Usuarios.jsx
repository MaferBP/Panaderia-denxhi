import { useEffect, useState } from "react";
import axios from "axios";

import "./Usuarios.css";

function Usuarios({ setPagina }) {

  const [usuarios, setUsuarios] = useState([]);

  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [contraseña, setContraseña] = useState("");

  const [rol, setRol] = useState("empleado");

  const [modoEdicion, setModoEdicion] = useState(false);

  const [idUsuario, setIdUsuario] = useState(null);

  // OBTENER USUARIOS
  const obtenerUsuarios = async () => {

    try {

      const respuesta = await axios.get(
        "http://192.168.1.28:8000/usuarios"
      );

      setUsuarios(respuesta.data);

    } catch (error) {

      console.log(error);

    }

  };

  // CREAR USUARIO
  const crearUsuario = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://192.168.1.28:8000/usuarios",
        {
          nombre,
          correo,
          contraseña,
          rol
        }
      );

      alert("Usuario creado");

      limpiarFormulario();

      obtenerUsuarios();

    } catch (error) {

      console.log(error);

    }

  };

  // ELIMINAR
  const eliminarUsuario = async (id) => {

    const confirmar = window.confirm(
      "¿Eliminar usuario?"
    );

    if (!confirmar) return;

    try {

      await axios.delete(
        `http://192.168.1.28:8000/usuarios/${id}`
      );

      obtenerUsuarios();

    } catch (error) {

      console.log(error);

    }

  };

  // EDITAR
  const editarUsuario = (usuario) => {

    setModoEdicion(true);

    setIdUsuario(usuario.id_usuario);

    setNombre(usuario.nombre);

    setCorreo(usuario.correo);

    setContraseña(usuario.contraseña);

    setRol(usuario.rol);

  };

  // ACTUALIZAR
  const actualizarUsuario = async (e) => {

    e.preventDefault();

    try {

      await axios.put(
        `http://192.168.1.28:8000/usuarios/${idUsuario}`,
        {
          nombre,
          correo,
          contraseña,
          rol
        }
      );

      alert("Usuario actualizado");

      limpiarFormulario();

      obtenerUsuarios();

    } catch (error) {

      console.log(error);

    }

  };

  // LIMPIAR
  const limpiarFormulario = () => {

    setNombre("");

    setCorreo("");

    setContraseña("");

    setRol("empleado");

    setModoEdicion(false);

    setIdUsuario(null);

  };

  useEffect(() => {

    obtenerUsuarios();

  }, []);

  return (

    <div className="usuarios-container">

      <div className="usuarios-header">

        <h1>
          Usuarios
        </h1>

        <button
          onClick={() => setPagina("dashboard")}
        >
          Volver
        </button>

      </div>

      <form
        className="usuarios-form"
        onSubmit={
          modoEdicion
          ?
          actualizarUsuario
          :
          crearUsuario
        }
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
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
          required
        />

        <input
          type="text"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) =>
            setContraseña(e.target.value)
          }
          required
        />

        <select
          value={rol}
          onChange={(e) =>
            setRol(e.target.value)
          }
        >

          <option value="admin">
            Administrador
          </option>

          <option value="empleado">
            Empleado
          </option>

        </select>

        <button type="submit">

          {
            modoEdicion
            ?
            "Actualizar"
            :
            "Crear usuario"
          }

        </button>

      </form>

      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>

          </tr>

        </thead>

        <tbody>

          {
            usuarios.map((usuario) => (

              <tr key={usuario.id_usuario}>

                <td>{usuario.id_usuario}</td>

                <td>{usuario.nombre}</td>

                <td>{usuario.correo}</td>

                <td>{usuario.rol}</td>

                <td>

                  <button
                    className="btn-editar"
                    onClick={() =>
                      editarUsuario(usuario)
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="btn-eliminar"
                    onClick={() =>
                      eliminarUsuario(usuario.id_usuario)
                    }
                  >
                    Eliminar
                  </button>

                </td>

              </tr>

            ))
          }

        </tbody>

      </table>

    </div>

  );

}

export default Usuarios;