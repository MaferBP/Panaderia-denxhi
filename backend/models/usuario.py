from pydantic import BaseModel

class Usuario(BaseModel):

    nombre: str

    correo: str

    contraseña: str

    rol: str


class Login(BaseModel):

    correo: str

    contraseña: str