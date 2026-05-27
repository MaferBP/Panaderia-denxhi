from fastapi import APIRouter

from database import conectar_db

from models.usuario import Usuario
from models.usuario import Login

router = APIRouter()

# LOGIN
@router.post("/login")
def login(datos: Login):

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    query = """
    SELECT * FROM usuarios
    WHERE correo = %s
    AND contraseña = %s
    """

    valores = (
        datos.correo,
        datos.contraseña
    )

    cursor.execute(query, valores)

    usuario = cursor.fetchone()

    conexion.close()

    if usuario:

        return {
            "mensaje": "Login exitoso",
            "usuario": usuario
        }

    return {
        "mensaje": "Correo o contraseña incorrectos"
    }


# OBTENER USUARIOS
@router.get("/usuarios")
def obtener_usuarios():

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios")

    usuarios = cursor.fetchall()

    conexion.close()

    return usuarios


# CREAR USUARIO
@router.post("/usuarios")
def crear_usuario(usuario: Usuario):

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    if usuario.rol == "admin":
        id_rol = 1
    else:
        id_rol = 2

    query = """
    INSERT INTO usuarios
    (nombre, correo, contraseña, id_rol, rol)
    VALUES (%s, %s, %s, %s, %s)
    """

    valores = (
        usuario.nombre,
        usuario.correo,
        usuario.contraseña,
        id_rol,
        usuario.rol
    )

    cursor.execute(query, valores)

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Usuario creado correctamente"
    }


# ACTUALIZAR
@router.put("/usuarios/{id_usuario}")
def actualizar_usuario(
    id_usuario: int,
    usuario: Usuario
):

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    if usuario.rol == "admin":
        id_rol = 1
    else:
        id_rol = 2

    query = """
    UPDATE usuarios
    SET nombre=%s,
        correo=%s,
        contraseña=%s,
        id_rol=%s,
        rol=%s
    WHERE id_usuario=%s
    """

    valores = (
        usuario.nombre,
        usuario.correo,
        usuario.contraseña,
        id_rol,
        usuario.rol,
        id_usuario
    )

    cursor.execute(query, valores)

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Usuario actualizado correctamente"
    }


# ELIMINAR
@router.delete("/usuarios/{id_usuario}")
def eliminar_usuario(id_usuario: int):

    conexion = conectar_db()

    cursor = conexion.cursor(dictionary=True)

    cursor.execute(
        "DELETE FROM usuarios WHERE id_usuario = %s",
        (id_usuario,)
    )

    conexion.commit()

    conexion.close()

    return {
        "mensaje": "Usuario eliminado correctamente"
    }