# Backend FastAPI - Chompas Mabel

Backend REST principal para cumplir la rubrica de Ingenieria Web. Expone la misma API que consume Angular bajo `/api` y usa MySQL con procedimientos almacenados para consultas principales.

## Ejecutar local

```bash
pip install -r requirements.txt
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
