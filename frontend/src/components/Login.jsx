import { useState } from "react";
import axios from "axios";

import "./Login.css";
import logo from "../assets/logo.png";

function Login() {

  const [correo, setCorreo] = useState("");

  const [contraseña, setContraseña] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const iniciarSesion = async (e) => {

    e.preventDefault();

    try {

      const respuesta = await axios.post(
        "http://192.168.1.28:8000/login",
        {

          correo: correo,

          contraseña: contraseña,

        }
      );

      if (
        respuesta.data.mensaje
        ===
        "Login exitoso"
      ) {

        setMensaje(
          "Inicio de sesión exitoso"
        );

        const usuario =
          respuesta.data.usuario;

        localStorage.setItem(
          "usuario",
          JSON.stringify(usuario)
        );

        alert(
          "Bienvenido " +
          usuario.nombre
        );

        // RECARGAR APP
        window.location.reload();

      } else {

        setMensaje(
          "Correo o contraseña incorrectos"
        );

      }

    } catch (error) {

      console.error(error);

      setMensaje(
        "Error al conectar con el servidor"
      );

    }

  };

  return (

    <div className="login-container">

      {/* IZQUIERDA */}

      <div className="login-left">

        <div className="overlay">

          <img
            src={logo}
            alt="Logo"
            className="logo"
          />

          <h1>
            El sabor que
          </h1>

          <h2>
            acompaña cada día
          </h2>

        </div>

      </div>

      {/* DERECHA */}

      <div className="login-right">

        <div className="login-card">

          <h1>
            Iniciar sesión
          </h1>

          <p>

            Bienvenido a

            {" "}

            <span>
              Panadería Denxhi
            </span>

          </p>

          <form onSubmit={iniciarSesion}>

            {/* CORREO */}

            <label>
              Correo electrónico
            </label>

            <div className="input-box">

              <input
                type="email"
                placeholder="Ingresa tu correo"
                value={correo}
                onChange={(e) =>
                  setCorreo(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* CONTRASEÑA */}

            <label>
              Contraseña
            </label>

            <div className="input-box">

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contraseña}
                onChange={(e) =>
                  setContraseña(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* BOTON */}

            <button type="submit">

              Iniciar sesión

            </button>

            {/* MENSAJE */}

            {
              mensaje
              &&
              <p className="mensaje-login">

                {mensaje}

              </p>
            }

          </form>

        </div>

      </div>

    </div>

  );

}

export default Login;