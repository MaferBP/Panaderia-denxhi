from fastapi import APIRouter
from pydantic import BaseModel

from database import conectar_db

router = APIRouter()


class MovimientoInventario(BaseModel):
    id_producto: int
    tipo_movimiento: str
    cantidad: int
    motivo: str | None = None
    id_usuario: int | None = None


@router.get("/inventario")
def obtener_inventario():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT *
    FROM productos
    ORDER BY stock ASC
    """

    cursor.execute(query)
    productos = cursor.fetchall()

    conexion.close()

    return productos


@router.get("/mermas")
def obtener_mermas():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mermas (
        id_merma INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL,
        motivo VARCHAR(255) NULL,
        id_usuario INT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    query = """
    SELECT
        mermas.id_merma,
        productos.nombre AS producto,
        mermas.cantidad,
        mermas.motivo,
        mermas.fecha,
        usuarios.nombre AS usuario
    FROM mermas
    INNER JOIN productos
    ON mermas.id_producto = productos.id_producto
    LEFT JOIN usuarios
    ON mermas.id_usuario = usuarios.id_usuario
    ORDER BY mermas.fecha DESC
    """

    cursor.execute(query)
    mermas = cursor.fetchall()

    conexion.close()

    return mermas


@router.get("/entradas")
def obtener_entradas():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entradas_inventario (
        id_entrada INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL,
        id_usuario INT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    query = """
    SELECT
        entradas_inventario.id_entrada,
        productos.nombre AS producto,
        entradas_inventario.cantidad,
        entradas_inventario.fecha,
        usuarios.nombre AS usuario
    FROM entradas_inventario
    INNER JOIN productos
    ON entradas_inventario.id_producto = productos.id_producto
    LEFT JOIN usuarios
    ON entradas_inventario.id_usuario = usuarios.id_usuario
    ORDER BY entradas_inventario.fecha DESC
    """

    cursor.execute(query)
    entradas = cursor.fetchall()

    conexion.close()

    return entradas


@router.post("/inventario")
def registrar_movimiento(movimiento: MovimientoInventario):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute(
        "SELECT stock FROM productos WHERE id_producto = %s",
        (movimiento.id_producto,)
    )

    producto = cursor.fetchone()

    if not producto:

        conexion.close()

        return {
            "mensaje": "Producto no encontrado"
        }

    stock_actual = producto["stock"]

    if movimiento.tipo_movimiento == "Entrada":

        nuevo_stock = stock_actual + movimiento.cantidad

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS entradas_inventario (
            id_entrada INT AUTO_INCREMENT PRIMARY KEY,
            id_producto INT NOT NULL,
            cantidad INT NOT NULL,
            id_usuario INT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        cursor.execute(
            """
            INSERT INTO entradas_inventario
            (id_producto, cantidad, id_usuario)
            VALUES (%s, %s, %s)
            """,
            (
                movimiento.id_producto,
                movimiento.cantidad,
                movimiento.id_usuario
            )
        )

    elif movimiento.tipo_movimiento == "Merma":

        if movimiento.cantidad > stock_actual:

            conexion.close()

            return {
                "mensaje": "No puedes registrar una merma mayor al stock"
            }

        nuevo_stock = stock_actual - movimiento.cantidad

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS mermas (
            id_merma INT AUTO_INCREMENT PRIMARY KEY,
            id_producto INT NOT NULL,
            cantidad INT NOT NULL,
            motivo VARCHAR(255) NULL,
            id_usuario INT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        cursor.execute(
            """
            INSERT INTO mermas
            (id_producto, cantidad, motivo, id_usuario)
            VALUES (%s, %s, %s, %s)
            """,
            (
                movimiento.id_producto,
                movimiento.cantidad,
                movimiento.motivo,
                movimiento.id_usuario
            )
        )

    else:

        conexion.close()

        return {
            "mensaje": "Movimiento invalido. Use 'Entrada' o 'Merma'"
        }

    cursor.execute(
        """
        UPDATE productos
        SET stock = %s
        WHERE id_producto = %s
        """,
        (
            nuevo_stock,
            movimiento.id_producto
        )
    )

    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Movimiento registrado correctamente"
    }
