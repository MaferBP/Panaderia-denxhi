import { useState } from "react";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Productos from "./components/Productos";
import Usuarios from "./components/Usuarios";
import Inventario from "./components/Inventario";
import Pedidos from "./components/Pedidos";
import Reportes from "./components/Reportes";
import CorteCaja from "./components/CorteCaja";

function App() {
  const [pagina, setPagina] = useState("dashboard");

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  if (!usuario) {
    return <Login />;
  }

  return (
    <>
      {pagina === "dashboard" && <Dashboard setPagina={setPagina} />}
      {pagina === "productos" && <Productos setPagina={setPagina} />}
      {pagina === "usuarios" && <Usuarios setPagina={setPagina} />}
      {pagina === "inventario" && <Inventario setPagina={setPagina} />}
      {pagina === "pedidos" && <Pedidos setPagina={setPagina} />}
      {pagina === "reportes" && <Reportes setPagina={setPagina} />}
      {pagina === "corteCaja" && <CorteCaja setPagina={setPagina} />}
    </>
  );
}

export default App;