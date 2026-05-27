from pydantic import BaseModel

class Movimiento(BaseModel):
    id_producto: int
    tipo_movimiento: str  # "Entrada" o "Merma"
    cantidad: int
