#!/usr/bin/env python3
"""
Script de verificación de conexiones - Panadería Denxhi
Verifica que todos los endpoints estén funcionando correctamente
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://192.168.1.28:8000"

# Colores para la consola
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BOLD}{BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def test_endpoint(method, endpoint, data=None, params=None, expected_status=None):
    """Prueba un endpoint y retorna el resultado"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, timeout=5)
        
        status_ok = response.status_code < 400
        
        if status_ok:
            print_success(f"{method:6} {endpoint:40} → {response.status_code}")
            return True, response.json() if response.text else None
        else:
            print_error(f"{method:6} {endpoint:40} → {response.status_code}")
            print_info(f"   Respuesta: {response.text[:100]}")
            return False, response.json() if response.text else None
            
    except requests.exceptions.ConnectionError:
        print_error(f"{method:6} {endpoint:40} → SIN CONEXIÓN")
        print_warning("   ¿Está corriendo el servidor backend?")
        return False, None
    except Exception as e:
        print_error(f"{method:6} {endpoint:40} → ERROR: {str(e)}")
        return False, None

def main():
    print(f"\n{BOLD}{BLUE}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║      VERIFICACIÓN DE CONEXIÓN - PANADERÍA DENXHI          ║")
    print("║                 Analizando todos los endpoints            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{RESET}")
    
    print(f"Base URL: {BLUE}{BASE_URL}{RESET}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    resultados = {
        "exitosos": 0,
        "fallidos": 0,
        "endpoints": []
    }
    
    # TEST 1: SALUD GENERAL
    print_header("1. VERIFICACIÓN DE SALUD DEL SERVIDOR")
    success, data = test_endpoint("GET", "/")
    if success:
        resultados["exitosos"] += 1
        print_info(f"Mensaje: {data.get('mensaje', 'N/A')}")
    else:
        resultados["fallidos"] += 1
        return
    
    # TEST 2: ESTADÍSTICAS
    print_header("2. ENDPOINTS DE REPORTES")
    for endpoint in ["/estadisticas", "/stock-bajo", "/productos-mas-vendidos"]:
        success, data = test_endpoint("GET", endpoint)
        resultados["exitosos"] += success
        resultados["fallidos"] += not success
    
    # TEST 3: PRODUCTOS
    print_header("3. ENDPOINTS DE PRODUCTOS")
    for endpoint in ["/productos", "/inventario"]:
        success, data = test_endpoint("GET", endpoint)
        resultados["exitosos"] += success
        resultados["fallidos"] += not success
    
    # TEST 4: USUARIOS
    print_header("4. ENDPOINTS DE USUARIOS")
    success, data = test_endpoint("GET", "/usuarios")
    resultados["exitosos"] += success
    resultados["fallidos"] += not success
    
    # TEST 5: PEDIDOS
    print_header("5. ENDPOINTS DE PEDIDOS")
    success, data = test_endpoint("GET", "/pedidos")
    resultados["exitosos"] += success
    resultados["fallidos"] += not success
    
    # TEST 6: NUEVO ENDPOINT DE INVENTARIO (POST)
    print_header("6. ENDPOINT NUEVO: POST /inventario")
    print_info("Probando registro de movimiento de inventario...")
    
    movimiento_data = {
        "id_producto": 1,
        "tipo_movimiento": "Entrada",
        "cantidad": 5
    }
    
    success, data = test_endpoint("POST", "/inventario", data=movimiento_data)
    if success:
        resultados["exitosos"] += 1
        print_info(f"   Mensaje: {data.get('mensaje', 'N/A')}")
        if 'stock_anterior' in data:
            print_info(f"   Stock anterior: {data['stock_anterior']}")
            print_info(f"   Stock nuevo: {data['stock_nuevo']}")
    else:
        resultados["fallidos"] += 1
    
    # TEST 7: LOGIN
    print_header("7. ENDPOINT DE AUTENTICACIÓN")
    login_data = {
        "correo": "admin@denxhi.com",
        "contraseña": "123456"
    }
    success, data = test_endpoint("POST", "/login", data=login_data)
    if success:
        resultados["exitosos"] += 1
        if 'usuario' in data:
            print_info(f"   Usuario encontrado: {data['usuario'].get('nombre', 'N/A')}")
    else:
        resultados["fallidos"] += 1
        print_warning("   Nota: El login puede fallar si las credenciales no existen en la BD")
    
    # TEST 8: VENTAS POR FECHA
    print_header("8. ENDPOINTS DE REPORTES AVANZADOS")
    hoy = datetime.now().date()
    hace_30_dias = hoy - timedelta(days=30)
    
    success, data = test_endpoint(
        "GET", 
        "/ventas-fecha",
        params={
            "fecha_inicio": str(hace_30_dias),
            "fecha_fin": str(hoy)
        }
    )
    resultados["exitosos"] += success
    resultados["fallidos"] += not success
    if success:
        print_info(f"   Registros encontrados: {len(data) if isinstance(data, list) else 'N/A'}")
    
    # RESUMEN FINAL
    print_header("RESUMEN FINAL")
    total = resultados["exitosos"] + resultados["fallidos"]
    porcentaje = (resultados["exitosos"] / total * 100) if total > 0 else 0
    
    print(f"{BOLD}Endpoints exitosos: {GREEN}{resultados['exitosos']}{RESET}")
    print(f"{BOLD}Endpoints fallidos: {RED}{resultados['fallidos']}{RESET}")
    print(f"{BOLD}Total probados: {BLUE}{total}{RESET}")
    print(f"{BOLD}Porcentaje de éxito: {GREEN if porcentaje >= 80 else YELLOW}{porcentaje:.1f}%{RESET}")
    
    if resultados["fallidos"] == 0:
        print(f"\n{BOLD}{GREEN}✅ ¡TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE!{RESET}")
        print("El proyecto está listo para usar.\n")
    else:
        print(f"\n{BOLD}{YELLOW}⚠️  HAY ALGUNOS ENDPOINTS QUE NO FUNCIONAN{RESET}")
        print("Revisa los errores arriba para más detalles.\n")
    
    # PRÓXIMOS PASOS
    print_header("PRÓXIMOS PASOS")
    print("1. Verifica que MySQL esté corriendo")
    print("2. Verifica las credenciales en: backend/database.py")
    print("3. Verifica que la BD 'panaderia_denxhi' exista")
    print("4. Inicia el frontend: cd frontend && npm run dev")
    print("5. Abre: http://localhost:5173")
    print()

if __name__ == "__main__":
    main()
