from pydantic import BaseModel

class CorteCaja(BaseModel):
    fecha_corte: str
    id_usuario: int
    total_pedidos: int
    total_vendido: float
    total_efectivo: float
    total_tarjeta: float
    total_transferencia: float
    efectivo_recibido: float
    cambio_entregado: float
    total_real_caja: float
    observaciones: str