from pydantic import BaseModel

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