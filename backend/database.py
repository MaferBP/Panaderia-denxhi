import mysql.connector

def conectar_db():

    conexion = mysql.connector.connect(
        host="denxhi2026mysqlmafer.mysql.database.azure.com",
        user="adminpan@denxhi2026mysqlmafer",
        password="Denxhi2026!",
        database="panaderia_denxhi",
        port=3306,
        ssl_disabled=False
    )

    return conexion