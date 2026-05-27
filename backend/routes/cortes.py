from fastapi import APIRouter
from database import conectar_db
from models.corte import CorteCaja

router = APIRouter()


@router.get("/cortes-caja")
def obtener_cortes():

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT 
        cortes_caja.*,
        usuarios.nombre AS usuario
    FROM cortes_caja
    LEFT JOIN usuarios
    ON cortes_caja.id_usuario = usuarios.id_usuario
    ORDER BY cortes_caja.fecha_registro DESC
    """

    cursor.execute(query)
    cortes = cursor.fetchall()

    conexion.close()

    return cortes


@router.post("/cortes-caja")
def guardar_corte(corte: CorteCaja):

    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)

    query = """
    INSERT INTO cortes_caja
    (
        fecha_corte,
        id_usuario,
        total_pedidos,
        total_vendido,
        total_efectivo,
        total_tarjeta,
        total_transferencia,
        efectivo_recibido,
        cambio_entregado,
        total_real_caja,
        observaciones
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    valores = (
        corte.fecha_corte,
        corte.id_usuario,
        corte.total_pedidos,
        corte.total_vendido,
        corte.total_efectivo,
        corte.total_tarjeta,
        corte.total_transferencia,
        corte.efectivo_recibido,
        corte.cambio_entregado,
        corte.total_real_caja,
        corte.observaciones
    )

    cursor.execute(query, valores)
    conexion.commit()
    conexion.close()

    return {
        "mensaje": "Corte de caja guardado correctamente"
    }