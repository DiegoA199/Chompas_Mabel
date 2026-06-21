# Chompas Mabel - Sistema Web de Gestion

Sistema web para administrar una empresa de chompas: login, dashboard, productos, inventario, clientes, pedidos, ventas, creditos y reportes.

## Tecnologias

- Frontend: Angular 21, TypeScript, Bootstrap 5, Bootstrap Icons, CSS propio, routing, servicios HTTP, formularios reactivos y signals para estados de interfaz.
- Backend: FastAPI, Uvicorn, Pydantic, MySQL Connector, endpoints REST y procedimientos almacenados.
- Base de datos: MySQL 8.4 con script reproducible en `database/schema.sql`, relaciones, restricciones y procedimientos almacenados.
- Docker: `docker-compose.yml` levanta MySQL y el backend FastAPI.

## Estructura final

```text
Chompas_Mabel_Real_Angular_SpringBoot/
|-- frontend-angular/
|   |-- src/
|   |   |-- app/
|   |   |   |-- core/
|   |   |   |   |-- models/
|   |   |   |   |-- services/
|   |   |   |   |-- interceptors/
|   |   |   |   |-- guards/
|   |   |   |   +-- config/
|   |   |   |-- shared/
|   |   |   |   |-- components/
|   |   |   |   |-- pipes/
|   |   |   |   +-- directives/
|   |   |   |-- features/
|   |   |   |   |-- auth/
|   |   |   |   |-- clientes/
|   |   |   |   |-- creditos/
|   |   |   |   |-- dashboard/
|   |   |   |   |-- inventario/
|   |   |   |   |-- pedidos/
|   |   |   |   |-- productos/
|   |   |   |   |-- reportes/
|   |   |   |   +-- ventas/
|   |   |   |-- layout/
|   |   |   |-- app.component.ts
|   |   |   |-- app.component.html
|   |   |   |-- app.component.css
|   |   |   |-- app.config.ts
|   |   |   +-- app.routes.ts
|   |   |-- assets/
|   |   |-- index.html
|   |   |-- main.ts
|   |   +-- styles.css
|   |-- angular.json
|   |-- package.json
|   +-- README.md
|-- backend-fastapi/
|   |-- app/
|   |   |-- core/
|   |   |   |-- config.py
|   |   |   |-- database.py
|   |   |   +-- serialization.py
|   |   |-- routers/
|   |   |-- services/
|   |   |-- main.py
|   |   +-- schemas.py
|   |-- main.py
|   |-- Dockerfile
|   |-- requirements.txt
|   +-- README.md
|-- database/
|   +-- schema.sql
|-- docs/
|-- docker-compose.yml
+-- README.md
```

## Estructura del backend segun la rubrica

- `app/main.py`: crea la aplicacion FastAPI, configura CORS e incluye routers.
- `routers`: define rutas REST por modulo (`auth`, `productos`, `clientes`, `pedidos`, `ventas`, `inventario`, `reportes`).
- `services`: contiene reglas de negocio y operaciones sobre MySQL.
- `core`: centraliza configuracion, conexion a base de datos y conversion de filas a JSON.
- `schemas.py`: contiene modelos Pydantic para validar datos de entrada.
- `main.py`: archivo minimo de compatibilidad para ejecutar `uvicorn main:app`.

## Estructura del frontend segun la rubrica

- `core/models`: interfaces TypeScript.
- `core/services`: logica de negocio y llamadas HTTP.
- `core/interceptors`: interceptor HTTP de autenticacion.
- `core/guards`: guards de rutas por rol.
- `core/config`: configuracion de API.
- `shared`: espacio para componentes, pipes y directivas reutilizables.
- `layout`: sidebar, topbar y cascaron visual.
- `features`: cada pantalla tiene `.component.ts`, `.component.html`, `.component.css` y `.routes.ts`.

## Requisitos

- Python 3.12+
- Node.js 22+
- npm
- MySQL 8.x instalado localmente o Docker Desktop

## Ejecucion local

Primero levanta la base de datos. Puedes usar Docker o MySQL local.

### Opcion A: Base de datos con Docker

```bash
docker compose up -d mysql
```

La base creada es `chompas_mabel_db` y se inicializa con `database/schema.sql`.

### Opcion B: Base de datos con MySQL local

```bash
mysql -u root -p < database/schema.sql
```

El backend usa por defecto:

```text
Base: chompas_mabel_db
Usuario: root
Password: root
Puerto: 3306
```

Si tu MySQL tiene otra contrasena:

```powershell
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="TU_PASSWORD"
```

Ejecuta el backend FastAPI:

```bash
cd backend-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API queda disponible en `http://localhost:8000/api`.

En otra terminal ejecuta el frontend:

```bash
cd frontend-angular
npm install
npm start
```

Abrir: `http://localhost:4200`

El frontend consume por defecto `http://localhost:8000/api`.

## Ejecucion con Docker

Para levantar MySQL y FastAPI:

```bash
docker compose up --build
```

FastAPI queda en `http://localhost:8000` y el frontend se ejecuta con Angular CLI desde `frontend-angular`.

## Credenciales demo

- Administrador: `admin@chompasmabel.com` / `admin123`
- Vendedor: `vendedor@chompasmabel.com` / `venta123`

## API principal

- `POST http://localhost:8000/api/auth/login`
- `GET http://localhost:8000/api/productos`
- `POST http://localhost:8000/api/productos`
- `PUT http://localhost:8000/api/productos/{id}`
- `DELETE http://localhost:8000/api/productos/{id}`
- `GET http://localhost:8000/api/clientes`
- `POST http://localhost:8000/api/clientes`
- `GET http://localhost:8000/api/pedidos`
- `POST http://localhost:8000/api/pedidos`
- `PATCH http://localhost:8000/api/pedidos/{id}/credito/pagar`
- `GET http://localhost:8000/api/ventas`
- `GET http://localhost:8000/api/inventario/movimientos`
- `GET http://localhost:8000/api/reportes/resumen`

## Notas de implementacion

- El proyecto conserva un solo backend: `backend-fastapi`.
- El backend ya no esta en un unico archivo grande; esta dividido en routers, servicios, core y schemas.
- Para Render existe un `Dockerfile` en la raiz que construye Angular y FastAPI en un solo Web Service.
- En produccion Angular llama a la API con el mismo dominio usando `/api`.
- Al registrar un pedido, el backend calcula subtotales, total, descuenta stock, registra movimientos de inventario y genera venta cuando corresponde.
- Si el metodo de pago es `Credito`, el backend calcula saldo pendiente, fecha de vencimiento y estado `PENDIENTE`, `VENCIDO` o `PAGADO`.
- La base de datos incluye procedimientos `sp_listar_productos`, `sp_listar_clientes`, `sp_listar_pedidos`, `sp_listar_detalles_pedido`, `sp_listar_ventas`, `sp_listar_movimientos_inventario` y `sp_resumen_reportes`.

La guia completa para crear, importar y verificar la base en otra PC esta en `docs/replicar_base_datos.md`.
La guia de estudio del codigo esta en `docs/guia_estudio_codigo.md`.
La guia de despliegue en Render esta en `docs/despliegue_render.md`.
