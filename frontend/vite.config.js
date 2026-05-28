import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiUrl = "https://panaderia-denxhi-api-a3c9hfckbndmhded.centralus-01.azurewebsites.net"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": apiUrl,
      "/productos": apiUrl,
      "/usuarios": apiUrl,
      "/pedidos": apiUrl,
      "/estadisticas": apiUrl,
      "/ventas-empleado": apiUrl,
      "/stock-bajo": apiUrl,
      "/productos-mas-vendidos": apiUrl,
      "/mermas": apiUrl,
      "/entradas": apiUrl,
      "/inventario": apiUrl,
      "/ventas-fecha": apiUrl,
      "/corte-caja": apiUrl,
      "/cortes-caja": apiUrl,
    },
  },
})
