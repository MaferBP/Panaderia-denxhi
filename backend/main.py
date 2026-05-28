from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import productos
from routes import usuarios
from routes import pedidos
from routes import reportes
from routes import inventario
from routes import cortes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lively-plant-0bc71e510.7.azurestaticapps.net",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(productos.router)
app.include_router(usuarios.router)
app.include_router(pedidos.router)
app.include_router(reportes.router)
app.include_router(inventario.router)
app.include_router(cortes.router)

@app.get("/")
def inicio():
    return {"mensaje": "API funcionando"}