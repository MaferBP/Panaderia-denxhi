from fastapi import APIRouter
from database import conectar_db

router = APIRouter()


@router.get("/estadisticas")
def estadisticas():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total FROM productos")
    productos = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) AS total FROM usuarios")
    usuarios = cursor.fetchone()["total"]

    cursor.execute("SELECT COALESCE(SUM(stock), 0) AS total FROM productos")
    inventario = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) AS total FROM pedidos")
    pedidos = cursor.fetchone()["total"]

    conexion.close()

    return {
        "productos": productos,
        "usuarios": usuarios,
        "inventario": inventario,
        "pedidos": pedidos
    }


@router.get("/ventas-fecha")
def ventas_por_fecha(fecha_inicio: str, fecha_fin: str):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT *
    FROM pedidos
    WHERE DATE(fecha) BETWEEN %s AND %s
    ORDER BY fecha ASC
    """

    cursor.execute(query, (fecha_inicio, fecha_fin))
    ventas = cursor.fetchall()

    conexion.close()

    return ventas


@router.get("/ventas-empleado/{id_usuario}")
def ventas_empleado(id_usuario: int):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT *
    FROM pedidos
    WHERE id_usuario = %s
    ORDER BY id_pedido DESC
    """

    cursor.execute(query, (id_usuario,))
    ventas = cursor.fetchall()

    conexion.close()

    return ventas


@router.get("/stock-bajo")
def stock_bajo():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT *
    FROM productos
    WHERE stock <= 5
    ORDER BY stock ASC
    """

    cursor.execute(query)
    productos = cursor.fetchall()

    conexion.close()

    return productos


@router.get("/productos-mas-vendidos")
def productos_mas_vendidos():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT
        productos.nombre,
        SUM(detalle_pedido.cantidad) AS total_vendido
    FROM detalle_pedido
    INNER JOIN productos
    ON detalle_pedido.id_producto = productos.id_producto
    GROUP BY productos.nombre
    ORDER BY total_vendido DESC
    LIMIT 5
    """

    cursor.execute(query)
    productos = cursor.fetchall()

    conexion.close()

    return productos


@router.get("/corte-caja")
def corte_caja(fecha: str):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query_resumen = """
    SELECT
        COUNT(*) AS total_pedidos,
        COALESCE(SUM(total), 0) AS total_vendido,
        COALESCE(SUM(CASE WHEN tipo_pago = 'Efectivo' THEN total ELSE 0 END), 0) AS total_efectivo,
        COALESCE(SUM(CASE WHEN tipo_pago = 'Tarjeta' THEN total ELSE 0 END), 0) AS total_tarjeta,
        COALESCE(SUM(CASE WHEN tipo_pago = 'Transferencia' THEN total ELSE 0 END), 0) AS total_transferencia,
        COALESCE(SUM(efectivo_recibido), 0) AS efectivo_recibido,
        COALESCE(SUM(cambio), 0) AS cambio_entregado
    FROM pedidos
    WHERE DATE(fecha) = %s
    """

    cursor.execute(query_resumen, (fecha,))
    resumen = cursor.fetchone()

    query_pedidos = """
    SELECT
        pedidos.id_pedido,
        pedidos.cliente,
        pedidos.total,
        pedidos.tipo_pago,
        pedidos.efectivo_recibido,
        pedidos.cambio,
        pedidos.fecha,
        usuarios.nombre AS empleado
    FROM pedidos
    LEFT JOIN usuarios
    ON pedidos.id_usuario = usuarios.id_usuario
    WHERE DATE(pedidos.fecha) = %s
    ORDER BY pedidos.id_pedido DESC
    """

    cursor.execute(query_pedidos, (fecha,))
    pedidos = cursor.fetchall()

    conexion.close()

    return {
        "fecha": fecha,
        "resumen": resumen,
        "pedidos": pedidos
    }