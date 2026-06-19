# Backend FastAPI - Chompas Mabel

Backend REST principal del sistema. Esta dividido por responsabilidades para evitar un unico archivo grande.

## Estructura

```text
backend-fastapi/
|-- app/
|   |-- core/
|   |   |-- config.py
|   |   |-- database.py
|   |   +-- serialization.py
|   |-- routers/
|   |   |-- auth.py
|   |   |-- clientes.py
|   |   |-- inventario.py
|   |   |-- pedidos.py
|   |   |-- productos.py
|   |   |-- reportes.py
|   |   +-- ventas.py
|   |-- services/
|   |   |-- auth_service.py
|   |   |-- cliente_service.py
|   |   |-- inventario_service.py
|   |   |-- pedido_service.py
|   |   |-- producto_service.py
|   |   |-- reporte_service.py
|   |   +-- venta_service.py
|   |-- main.py
|   +-- schemas.py
|-- main.py
|-- requirements.txt
+-- Dockerfile
```

## Capas

- `routers`: rutas REST que recibe Angular.
- `services`: reglas de negocio, validaciones de flujo y operaciones con la base.
- `core`: conexion MySQL, configuracion y conversion de datos a JSON.
- `schemas.py`: modelos Pydantic para validar entradas.
- `app/main.py`: crea la app FastAPI, configura CORS e incluye routers.
- En produccion, `app/main.py` tambien sirve el build de Angular si existe `FRONTEND_DIST`.

## Ejecutar local

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tambien existe `main.py` como compatibilidad:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Variables opcionales:

```text
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=chompas_mabel_db
MYSQL_USER=root
MYSQL_PASSWORD=root
```

Tambien puedes usar una URL completa:

```text
MYSQL_URL=mysql://usuario:password@host:3306/chompas_mabel_db
```

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/productos`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`
- `GET /api/clientes`
- `POST /api/clientes`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `PATCH /api/pedidos/{id}/credito/pagar`
- `GET /api/ventas`
- `GET /api/inventario/movimientos`
- `GET /api/reportes/resumen`
