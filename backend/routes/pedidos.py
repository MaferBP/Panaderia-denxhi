from fastapi import APIRouter
from pydantic import BaseModel

from database import conectar_db

router = APIRouter()


class DetallePedido(BaseModel):
    id_producto: int
    cantidad: int


class Pedido(BaseModel):
    cliente: str
    total: float
    tipo_pago: str
    efectivo_recibido: float
    cambio: float
    id_usuario: int
    productos: list[DetallePedido]


@router.get("/pedidos")
def obtener_pedidos():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            p.id_pedido,
            p.cliente,
            p.total,
            p.tipo_pago,
            p.efectivo_recibido,
            p.cambio,
            p.fecha,
            p.id_usuario,
            u.nombre as empleado
        FROM pedidos p
        LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY p.fecha DESC
    """)

    pedidos = cursor.fetchall()
    conexion.close()

    return pedidos


@router.post("/pedidos")
def crear_pedido(pedido: Pedido):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    total = 0
    detalles = []

    for item in pedido.productos:
        cursor.execute(
            "SELECT * FROM productos WHERE id_producto = %s",
            (item.id_producto,)
        )

        producto = cursor.fetchone()

        if not producto:
            conexion.close()
            return {
                "mensaje": f"Producto no encontrado: {item.id_producto}"
            }

        if item.cantidad > producto["stock"]:
            conexion.close()
            return {
                "mensaje": f"Stock insuficiente para {producto['nombre']}"
            }

        subtotal = producto["precio"] * item.cantidad
        total += subtotal

        detalles.append({
            "id_producto": item.id_producto,
            "cantidad": item.cantidad,
            "precio": producto["precio"],
            "subtotal": subtotal,
            "stock_actual": producto["stock"]
        })

    cursor.execute(
        """
        INSERT INTO pedidos
        (cliente, total, tipo_pago, efectivo_recibido, cambio, id_usuario)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            pedido.cliente,
            total,
            pedido.tipo_pago,
            pedido.efectivo_recibido,
            pedido.cambio,
            pedido.id_usuario
        )
    )

    conexion.commit()
    id_pedido = cursor.lastrowid

    for detalle in detalles:
        cursor.execute(
            "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio, subtotal) VALUES (%s, %s, %s, %s, %s)",
            (
                id_pedido,
                detalle["id_producto"],
                detalle["cantidad"],
                detalle["precio"],
                detalle["subtotal"]
            )
        )

        nuevo_stock = detalle["stock_actual"] - detalle["cantidad"]
        cursor.execute(
            "UPDATE productos SET stock = %s WHERE id_producto = %s",
            (
                nuevo_stock,
                detalle["id_producto"]
            )
        )

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Pedido registrado correctamente",
        "total": total
    }
