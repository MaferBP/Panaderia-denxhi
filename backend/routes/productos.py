from fastapi import APIRouter, HTTPException
from mysql.connector import Error

from database import conectar_db

from models.producto import Producto

router = APIRouter()


# OBTENER PRODUCTOS
@router.get("/productos")
def obtener_productos(
    buscar: str | None = None,
    categoria: str | None = None
):

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    filtros = []
    valores = []

    if buscar:

        texto_busqueda = f"%{buscar}%"
        filtros.append(
            "(nombre LIKE %s OR categoria LIKE %s OR descripcion LIKE %s)"
        )
        valores.extend([
            texto_busqueda,
            texto_busqueda,
            texto_busqueda
        ])

    if categoria:

        filtros.append("categoria = %s")
        valores.append(categoria)

    query = """
    SELECT *
    FROM productos
    """

    if filtros:

        query += " WHERE " + " AND ".join(filtros)

    query += " ORDER BY id_producto DESC"

    cursor.execute(query, tuple(valores))

    productos = cursor.fetchall()

    conexion.close()

    return productos


# AGREGAR PRODUCTO
@router.post("/productos")
def agregar_producto(producto: Producto):

    conexion = conectar_db()

    cursor = conexion.cursor()

    query = """
    INSERT INTO productos
    (
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        imagen
    )
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    valores = (
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.categoria,
        producto.imagen
    )

    cursor.execute(query, valores)

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Producto agregado correctamente"
    }


# ACTUALIZAR
@router.put("/productos/{id_producto}")
def actualizar_producto(
    id_producto: int,
    producto: Producto
):

    conexion = conectar_db()

    cursor = conexion.cursor()

    query = """
    UPDATE productos
    SET
        nombre = %s,
        descripcion = %s,
        precio = %s,
        stock = %s,
        categoria = %s,
        imagen = %s
    WHERE id_producto = %s
    """

    valores = (
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.categoria,
        producto.imagen,
        id_producto
    )

    cursor.execute(query, valores)

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Producto actualizado correctamente"
    }


# ELIMINAR
@router.delete("/productos/{id_producto}")
def eliminar_producto(id_producto: int):

    conexion = conectar_db()

    cursor = conexion.cursor()

    query = """
    DELETE FROM productos
    WHERE id_producto = %s
    """

    try:

        cursor.execute(query, (id_producto,))

        conexion.commit()

    except Error as error:

        conexion.rollback()

        if error.errno == 1451:

            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar este producto porque ya tiene ventas, entradas o mermas registradas"
            )

        raise HTTPException(
            status_code=500,
            detail="Error al eliminar el producto"
        )

    finally:

        conexion.close()

    return {
        "mensaje": "Producto eliminado correctamente"
    }
