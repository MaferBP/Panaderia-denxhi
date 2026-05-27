# 🔗 GUÍA DE RECONEXIÓN - Panadería Denxhi

## ✅ CAMBIOS REALIZADOS

### Problema Identificado
El endpoint `POST /inventario` no existía en el backend, pero el frontend intentaba hacer POST para registrar entradas y mermas.

### Soluciones Implementadas
1. **Nuevo modelo**: `backend/models/movimiento.py`
   - Define la estructura para registrar movimientos
   - Campos: id_producto, tipo_movimiento, cantidad

2. **Nuevo endpoint**: `POST /inventario` en `backend/routes/inventario.py`
   - Registra entradas y mermas de inventario
   - Valida que el producto exista
   - Valida que haya stock suficiente para mermas
   - Actualiza automáticamente el stock
   - Retorna: stock anterior, nuevo stock y mensajes de éxito/error

---

## 🚀 PARA EJECUTAR EL PROYECTO

### 1️⃣ INICIA EL BACKEND

```bash
cd backend
python main.py
```

**Esperado:**
```
INFO:     Uvicorn running on http://192.168.1.28:8000
```

### 2️⃣ EN OTRA TERMINAL - INICIA EL FRONTEND

```bash
cd frontend
npm install  # si no lo has hecho
npm run dev
```

**Esperado:**
```
VITE v5.0.0  ready in 123 ms
➜  Local:   http://localhost:5173/
```

---

## ✔️ VERIFICACIÓN DE ENDPOINTS

### Probar cada endpoint con curl o Postman:

**1. Estadísticas**
```bash
curl http://192.168.1.28:8000/estadisticas
```

**2. Obtener Productos**
```bash
curl http://192.168.1.28:8000/productos
```

**3. Obtener Inventario**
```bash
curl http://192.168.1.28:8000/inventario
```

**4. Registrar Movimiento de Inventario (NUEVO)**
```bash
curl -X POST http://192.168.1.28:8000/inventario \
  -H "Content-Type: application/json" \
  -d '{"id_producto": 1, "tipo_movimiento": "Entrada", "cantidad": 10}'
```

**5. Login**
```bash
curl -X POST http://192.168.1.28:8000/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "admin@denxhi.com", "contraseña": "123456"}'
```

---

## 📋 ENDPOINTS DISPONIBLES

### ✅ USUARIOS
- `GET /usuarios` - Obtener todos
- `POST /usuarios` - Crear
- `PUT /usuarios/{id_usuario}` - Actualizar
- `DELETE /usuarios/{id_usuario}` - Eliminar
- `POST /login` - Iniciar sesión

### ✅ PRODUCTOS
- `GET /productos` - Obtener todos
- `POST /productos` - Crear
- `PUT /productos/{id_producto}` - Actualizar
- `DELETE /productos/{id_producto}` - Eliminar

### ✅ PEDIDOS
- `GET /pedidos` - Obtener todos
- `POST /pedidos` - Crear pedido

### ✅ INVENTARIO (ACTUALIZADO)
- `GET /inventario` - Ver inventario completo
- `POST /inventario` - **NUEVO** Registrar movimiento

### ✅ REPORTES
- `GET /estadisticas` - Stats generales
- `GET /stock-bajo` - Productos con stock bajo (≤ 5)
- `GET /productos-mas-vendidos` - Top 5 productos
- `GET /ventas-fecha?fecha_inicio=2024-01-01&fecha_fin=2024-12-31` - Ventas por rango
- `GET /ventas-empleado/{id_usuario}` - Ventas de un empleado

---

## 🔍 VERIFICAR CONEXIÓN A BD

El backend usa MySQL con estas credenciales (en `database.py`):
- Host: `localhost`
- User: `root`
- Password: (vacía)
- Database: `panaderia_denxhi`

**Para verificar en MySQL:**
```sql
SHOW TABLES;
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM pedidos;
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"
- Verifica que MySQL esté corriendo
- Verifica credenciales en `backend/database.py`
- Verifica que la BD `panaderia_denxhi` exista

### Error: "CORS error" en el navegador
- El CORS ya está configurado en `backend/main.py` para `http://localhost:5173`
- Si cambias el puerto del frontend, actualiza en `main.py`

### Error: "conexion.commit() failed"
- Verifica que las tablas existan en MySQL
- Revisa los tipos de datos en la BD

### El endpoint POST /inventario retorna error
- Verifica que el `id_producto` exista
- Para mermas, verifica que haya stock suficiente
- Revisa los tipos: `tipo_movimiento` debe ser "Entrada" o "Merma"

---

## 📝 ESTRUCTURA DE ARCHIVOS IMPORTANTE

```
backend/
├── main.py                 # FastAPI app con CORS
├── database.py            # Conexión MySQL
├── models/
│   ├── usuario.py
│   ├── producto.py
│   └── movimiento.py       # ✅ NUEVO
└── routes/
    ├── usuarios.py
    ├── productos.py
    ├── pedidos.py
    ├── reportes.py
    └── inventario.py       # ✅ ACTUALIZADO

frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Productos.jsx
│   │   ├── Inventario.jsx  # Usa POST /inventario
│   │   ├── Pedidos.jsx
│   │   ├── Usuarios.jsx
│   │   └── Reportes.jsx
│   └── main.jsx
└── package.json
```

---

## 🎯 FLUJO COMPLETO A PROBAR

1. **Abre** `http://localhost:5173` en el navegador
2. **Login** con credenciales de la BD
3. **Dashboard**: Verifica estadísticas se cargan
4. **Inventario**: Registra un movimiento de entrada
5. **Inventario**: Verifica que el stock se actualizó
6. **Productos**: Verifica que se muestre el nuevo stock
7. **Pedidos**: Crea un pedido
8. **Dashboard**: Verifica que se actualicen las stats

¡Todo conectado! 🎉
