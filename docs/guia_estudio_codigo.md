# Guia de estudio del codigo - Chompas Mabel

Esta guia resume las partes mas importantes del proyecto para estudiar, explicar y defender el codigo.

## Vision general

El sistema tiene tres partes:

- `frontend-angular`: interfaz web que usa el usuario.
- `backend-fastapi`: API REST que recibe las peticiones, valida datos y consulta MySQL.
- `database/schema.sql`: script que crea la base de datos, tablas, datos iniciales y procedimientos almacenados.

En produccion para Render, FastAPI tambien puede servir el build de Angular. Asi todo funciona en un solo dominio:

```text
https://tu-dominio.com          -> Angular
https://tu-dominio.com/api/...  -> FastAPI
```

## Carpetas principales

### `frontend-angular`

Contiene la aplicacion Angular.

- `src/app/core/models`: interfaces TypeScript que describen los datos del sistema.
- `src/app/core/services`: servicios que llaman al backend y guardan estado.
- `src/app/features`: pantallas principales del sistema.
- `src/app/layout`: estructura comun de navegacion.
- `src/app/app.routes.ts`: rutas y permisos por rol.
- `src/styles.css`: estilos globales.

### `backend-fastapi`

Contiene el unico backend del proyecto.

- `app/main.py`: crea FastAPI, configura CORS, registra routers y sirve Angular en produccion.
- `app/routers`: define endpoints REST por modulo.
- `app/services`: contiene logica de negocio y operaciones con la base de datos.
- `app/core/config.py`: lee variables de entorno de MySQL.
- `app/core/database.py`: abre conexiones, ejecuta consultas y llama procedimientos almacenados.
- `app/core/serialization.py`: convierte fechas, decimales y nombres de columnas a JSON.
- `app/schemas.py`: modelos Pydantic para validar entradas.
- `main.py`: compatibilidad para ejecutar `uvicorn main:app`.
- `requirements.txt`: dependencias Python.
- `Dockerfile`: imagen simple para ejecutar solo FastAPI.

### `database`

- `schema.sql`: crea la base `chompas_mabel_db`, tablas, relaciones, datos iniciales y procedimientos almacenados.

### `docs`

Contiene documentos de soporte para estudiar, replicar base de datos, defender codigo y desplegar.

## Backend FastAPI por partes

### `app/main.py`

Es el punto central de la API.

Hace esto:

- Crea la aplicacion con `FastAPI(...)`.
- Configura CORS para permitir peticiones desde Angular en desarrollo.
- Expone `/api/health` para verificar que el backend esta vivo.
- Incluye los routers: auth, productos, clientes, pedidos, ventas, inventario y reportes.
- Si existe un build de Angular en `FRONTEND_DIST`, sirve la aplicacion web.

Para que se usa:

- En local, permite ejecutar la API con `uvicorn app.main:app`.
- En Render, permite que el mismo servicio entregue frontend y backend en un solo dominio.

### `app/core/config.py`

Lee la configuracion de MySQL.

Acepta dos formas:

- `MYSQL_URL`, por ejemplo `mysql://usuario:password@host:3306/chompas_mabel_db`.
- Variables separadas: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`.

Para que se usa:

- Evita escribir credenciales dentro del codigo.
- Permite cambiar entre MySQL local, Docker y Render sin modificar archivos Python.

### `app/core/database.py`

Centraliza el acceso a MySQL.

Funciones importantes:

- `connection()`: abre una conexion.
- `fetch_all()`: ejecuta una consulta y devuelve varias filas.
- `fetch_one()`: ejecuta una consulta y devuelve una fila.
- `call_proc()`: ejecuta procedimientos almacenados.

Para que se usa:

- Evita repetir conexion y transformacion de datos en todos los routers.
- Hace que los servicios se concentren en reglas de negocio.

### `app/core/serialization.py`

Convierte datos de MySQL a formato compatible con Angular.

Hace esto:

- Convierte `Decimal` a numero.
- Convierte `date` y `datetime` a texto ISO.
- Convierte columnas snake_case a camelCase.

Ejemplo:

```text
saldo_pendiente -> saldoPendiente
fecha_pedido -> fechaPedido
```

Para que se usa:

- Angular espera nombres como `saldoPendiente`, no `saldo_pendiente`.
- Evita errores al convertir decimales y fechas a JSON.

### `app/schemas.py`

Define los modelos de entrada con Pydantic.

Modelos importantes:

- `LoginRequest`: correo y password.
- `ProductoPayload`: datos para crear o actualizar productos.
- `ClientePayload`: datos para registrar clientes.
- `PedidoPayload`: datos para registrar pedidos y creditos.
- `DetallePedidoPayload`: producto y cantidad dentro de un pedido.

Para que se usa:

- Valida que el correo tenga formato correcto.
- Evita precios o stocks negativos.
- Evita cantidades menores o iguales a cero.
- Evita nombres demasiado cortos o campos vacios.

## Routers

Los routers reciben peticiones HTTP y llaman a los servicios.

### `routers/auth.py`

Endpoint:

- `POST /api/auth/login`

Uso:

- Recibe correo y password.
- Devuelve token demo, id de usuario, nombre y rol.

### `routers/productos.py`

Endpoints:

- `GET /api/productos`
- `POST /api/productos`
- `PUT /api/productos/{producto_id}`
- `DELETE /api/productos/{producto_id}`

Uso:

- Administra catalogo de productos.
- Calcula estado `STOCK_BAJO` cuando el stock es menor o igual a 10.

### `routers/clientes.py`

Endpoints:

- `GET /api/clientes`
- `POST /api/clientes`

Uso:

- Lista clientes.
- Registra nuevos clientes.

### `routers/pedidos.py`

Endpoints:

- `GET /api/pedidos`
- `POST /api/pedidos`
- `PATCH /api/pedidos/{pedido_id}/credito/pagar`

Uso:

- Lista pedidos con sus detalles.
- Registra pedidos.
- Descuenta stock.
- Registra movimientos de inventario.
- Genera venta si el pedido esta confirmado.
- Controla saldos de credito.

### `routers/ventas.py`

Endpoint:

- `GET /api/ventas`

Uso:

- Lista ventas cerradas.

### `routers/inventario.py`

Endpoint:

- `GET /api/inventario/movimientos`

Uso:

- Lista entradas y salidas de inventario.
- Permite filtrar por producto con `productoId`.

### `routers/reportes.py`

Endpoint:

- `GET /api/reportes/resumen`

Uso:

- Devuelve total de ventas, saldo de credito, creditos vencidos, valor de inventario y stock bajo.

## Servicios

Los servicios contienen la logica importante.

### `auth_service.py`

- Busca el usuario por correo.
- Verifica password y estado activo.
- Devuelve rol `ADMIN` o `VENDEDOR`.

### `producto_service.py`

- Lista productos desde `sp_listar_productos`.
- Crea productos.
- Actualiza productos.
- Elimina productos.
- Resuelve la categoria existente o crea una nueva.
- Registra movimiento de inventario inicial si el producto tiene stock.

### `cliente_service.py`

- Lista clientes desde `sp_listar_clientes`.
- Limpia campos opcionales vacios.
- Registra clientes nuevos.

### `pedido_service.py`

Es uno de los archivos mas importantes.

Hace esto al crear un pedido:

- Valida que el pedido tenga detalles.
- Valida que exista el cliente.
- Valida que exista el usuario.
- Genera numero de pedido si no se envia uno.
- Consulta productos con bloqueo `FOR UPDATE`.
- Valida stock suficiente.
- Calcula subtotal y total.
- Descuenta stock.
- Registra salida de inventario.
- Calcula credito si el pago es `Credito`.
- Guarda saldo pendiente y fecha de vencimiento.
- Genera venta cuando corresponde.

### `inventario_service.py`

- Llama `sp_listar_movimientos_inventario`.
- Devuelve movimientos generales o por producto.

### `venta_service.py`

- Llama `sp_listar_ventas`.
- Devuelve historial de ventas.

### `reporte_service.py`

- Llama `sp_resumen_reportes`.
- Devuelve indicadores administrativos.

## Frontend Angular por partes

### `src/app/app.routes.ts`

Define las rutas:

- `/login`
- `/dashboard`
- `/productos`
- `/pedidos`
- `/clientes`
- `/ventas`
- `/creditos`
- `/inventario`
- `/reportes`

Tambien define permisos por rol.

### `src/app/core/services/environment.ts`

Define la URL del backend.

En local:

```text
http://localhost:8000/api
```

En Render:

```text
https://tu-dominio.com/api
```

### `auth.service.ts`

- Hace login.
- Guarda token, usuario, id y rol en `localStorage`.
- Expone `isAdmin` e `isVendedor`.
- Cierra sesion.

### `auth.interceptor.ts`

- Agrega token a las peticiones.
- Si el backend devuelve `401`, limpia sesion.

### Servicios de negocio

- `producto.service.ts`: productos, stock bajo y valor de inventario.
- `pedido.service.ts`: pedidos, ventas cerradas, creditos y pagos.
- `cliente.service.ts`: clientes.
- `inventario.service.ts`: movimientos de inventario.
- `reportes.service.ts`: indicadores administrativos.
- `busqueda.service.ts`: busqueda global normalizada.

## Base de datos

Tablas principales:

- `usuarios`: login y roles.
- `clientes`: datos de clientes.
- `categorias`: categorias de productos.
- `productos`: catalogo, precio, talla, color y stock.
- `pedidos`: cabecera de pedidos, total y credito.
- `detalle_pedido`: productos dentro de cada pedido.
- `ventas`: ventas generadas desde pedidos.
- `inventario_movimientos`: entradas y salidas de stock.

Procedimientos importantes:

- `sp_listar_productos`
- `sp_listar_clientes`
- `sp_listar_pedidos`
- `sp_listar_detalles_pedido`
- `sp_listar_ventas`
- `sp_listar_movimientos_inventario`
- `sp_resumen_reportes`

## Preguntas frecuentes para defensa

### Por que el backend no esta en un solo archivo

Porque cada carpeta tiene una responsabilidad:

- Router: recibe la peticion.
- Service: aplica reglas de negocio.
- Core: maneja configuracion y base de datos.
- Schema: valida datos.

Esto hace que el proyecto sea mas facil de explicar, mantener y corregir.

### Que pasa cuando se crea un pedido

El backend valida cliente, usuario, productos y stock. Luego calcula total, descuenta inventario, registra detalle, calcula credito si aplica y genera venta si el estado corresponde.

### Por que se usan procedimientos almacenados

Porque centralizan consultas importantes en MySQL y permiten probar reportes y listados directamente desde la base de datos.

### Como funciona en Render

Render construye Angular con Node, copia el resultado al contenedor Python y levanta FastAPI. FastAPI responde `/api/...` y para el resto de rutas devuelve Angular.
