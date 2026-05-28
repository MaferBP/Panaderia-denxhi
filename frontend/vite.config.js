import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": "http://127.0.0.1:8000",
      "/productos": "http://127.0.0.1:8000",
      "/usuarios": "http://127.0.0.1:8000",
      "/pedidos": "http://127.0.0.1:8000",
      "/estadisticas": "http://127.0.0.1:8000",
      "/ventas-empleado": "http://127.0.0.1:8000",
      "/stock-bajo": "http://127.0.0.1:8000",
      "/productos-mas-vendidos": "http://127.0.0.1:8000",
      "/mermas": "http://127.0.0.1:8000",
      "/entradas": "http://127.0.0.1:8000",
      "/inventario": "http://127.0.0.1:8000",
      "/ventas-fecha": "http://127.0.0.1:8000",
      "/corte-caja": "http://127.0.0.1:8000",
      "/cortes-caja": "http://127.0.0.1:8000",
    },
  },
})
