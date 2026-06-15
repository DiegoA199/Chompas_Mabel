# Guia de defensa del codigo - Chompas Mabel

Esta guia sirve para responder si el docente senala una linea especifica del proyecto y pregunta para que sirve. La idea no es memorizar todo, sino explicar por bloques: imports, estado, rutas, servicios, validaciones, endpoints y base de datos.

## Respuesta general

Si preguntan si conoces el codigo, responde:

> Si, conozco la estructura y puedo explicar cada archivo por responsabilidades. En Angular estan las rutas, componentes, formularios y servicios HTTP. En FastAPI estan los endpoints, validaciones y conexion a MySQL. En `database/schema.sql` estan las tablas, relaciones, datos iniciales y procedimientos almacenados.

## Frontend Angular

### `frontend-angular/src/app/app.routes.ts`

- Lineas 1 a 12: importan los componentes y el `roleGuard` que se usaran en las rutas.
- Linea 14: declara el arreglo principal de rutas de Angular.
- Linea 15: define `/login`, que carga la pantalla de autenticacion.
- Linea 16: define el layout principal. Dentro de este layout se muestran las paginas internas del sistema.
- Linea 17: redirige la ruta vacia hacia `dashboard`.
- Lineas 18 a 24: conectan cada ruta con su componente: dashboard, productos, pedidos, clientes, ventas y creditos.
- Linea 20: protege `/inventario` para que solo entre el rol ADMIN.
- Linea 25: protege `/reportes` para que solo entre el rol ADMIN.
- Linea 27: cualquier ruta no encontrada redirige al dashboard.

Respuesta si preguntan por este archivo:

> Este archivo controla la navegacion de la aplicacion. Aqui se decide que componente se muestra segun la URL y tambien que modulos son exclusivos del administrador.

### `frontend-angular/src/app/core/services/auth.service.ts`

- Lineas 1 a 5: importan Angular, HTTP, router, RxJS y la URL del backend.
- Lineas 7 a 12: definen la forma de la respuesta del login.
- Lineas 16 a 18: guardan en signals el usuario, rol e id recuperados desde `localStorage`.
- Lineas 20 a 25: crean valores calculados para saber si el usuario esta logueado y si es ADMIN o VENDEDOR.
- Lineas 29 a 41: envian correo y password al backend; si la respuesta es correcta, guardan token, usuario y rol.
- Linea 39: despues del login correcto redirige al dashboard.
- Lineas 44 a 53: limpian la sesion y regresan al login.

Respuesta si preguntan por `signal` o `computed`:

> `signal` guarda estado reactivo y `computed` calcula valores derivados. Por ejemplo, `isAdmin` depende del rol guardado y se actualiza cuando cambia la sesion.

### `frontend-angular/src/app/core/services/auth.interceptor.ts`

- Lineas 6 a 9: interceptan cada peticion HTTP y agregan el token en el encabezado Authorization.
- Lineas 11 a 18: controlan errores HTTP.
- Lineas 13 a 15: si el backend responde 401, se cierra la sesion automaticamente.

Respuesta:

> El interceptor evita repetir codigo en todos los servicios. Agrega el token a las peticiones y si la sesion vence, limpia el usuario y vuelve al login.

### `frontend-angular/src/app/core/services/pedido.service.ts`

- Lineas 9 a 20: guardan pedidos y calculan metricas como ventas cerradas, creditos pendientes, vencidos y saldo por cobrar.
- Lineas 26 a 33: cargan pedidos desde `/api/pedidos`.
- Lineas 36 a 39: registran un pedido nuevo en el backend y actualizan la lista local.
- Lineas 42 a 47: marcan un credito como pagado usando `PATCH`.
- Lineas 50 a 52: consideran venta cerrada a un pedido ENTREGADO o VENDIDO.

Respuesta:

> Este servicio concentra la logica de pedidos y creditos en el frontend. Asi los componentes no calculan todo directamente, solo muestran los datos.

### `frontend-angular/src/app/core/services/reportes.service.ts`

- Lineas 10 y 11: guardan pedidos y productos.
- Lineas 15 a 21: calculan ventas cerradas, total de ventas, creditos, creditos vencidos, stock bajo y valor del inventario.
- Lineas 27 a 40: usan `forkJoin` para cargar pedidos y productos al mismo tiempo.
- Lineas 43 a 45: definen que una venta cerrada es ENTREGADO, VENDIDO o con venta generada.

Respuesta:

> Reportes no usa numeros fijos; calcula indicadores a partir de pedidos y productos cargados desde el backend.

### Componentes principales

- `features/productos/productos.component.ts`: muestra catalogo y mantenimiento de productos.
- `features/inventario/inventario.component.ts`: muestra movimientos de inventario y filtro por producto.
- `features/pedidos/pedidos.component.ts`: registra pedidos y permite ventas a credito.
- `features/ventas/ventas.component.ts`: lista ventas cerradas.
- `features/creditos/creditos.component.ts`: muestra cuentas por cobrar y permite marcar creditos pagados.
- `features/reportes/reportes.component.ts`: presenta metricas administrativas.

Respuesta:

> Los componentes se encargan de la vista y de llamar a los servicios. La logica compartida se mantiene en servicios para no duplicarla.

## Backend FastAPI

### `backend-fastapi/main.py`

- Lineas 1 a 9: importan librerias para sistema, fechas, decimales, MySQL, FastAPI, CORS y validaciones.
- Linea 12: crea la aplicacion FastAPI.
- Lineas 14 a 20: configuran CORS para permitir que Angular consuma el backend desde localhost.
- Lineas 23 a 30: leen la configuracion de MySQL desde variables de entorno.
- Lineas 33 y 34: abren conexion a MySQL.
- Lineas 37 a 53: convierten nombres y valores de MySQL a formato JSON usable por Angular.
- Lineas 56 a 63: ejecutan consultas que devuelven varias filas.
- Lineas 66 a 68: devuelven una sola fila.
- Lineas 71 a 80: ejecutan procedimientos almacenados.
- Lineas 91 a 129: definen modelos de entrada para login, productos, clientes y pedidos.

Respuesta si preguntan por modelos Pydantic:

> Estos modelos validan los datos antes de llegar a la base de datos. Por ejemplo, un producto no puede tener precio negativo y un cliente debe tener correo valido.

### Endpoints principales

- Lineas 195 a 212: login. Busca usuario por correo y password; si no existe devuelve 401.
- Lineas 215 a 217: lista productos usando `sp_listar_productos`.
- Lineas 220 a 260: crea producto, resuelve categoria y registra stock inicial.
- Lineas 262 a 298: actualiza producto existente.
- Lineas 300 a 312: elimina producto.
- Lineas 314 a 316: lista clientes.
- Lineas 319 a 345: crea cliente.
- Lineas 347 a 350: lista pedidos.
- Lineas 376 a 478: crea pedido, calcula total, descuenta stock, genera venta si corresponde y registra movimiento de inventario.
- Lineas 480 a 502: marca un credito como pagado.
- Lineas 504 a 506: lista ventas cerradas.
- Lineas 509 a 512: lista movimientos de inventario, con filtro opcional por producto.
- Lineas 514 a 516: devuelve resumen de reportes.

Respuesta:

> Los endpoints son la entrada del backend. Cada endpoint representa una operacion del negocio: autenticar, listar, crear, actualizar, registrar pedido, pagar credito o consultar reportes.

## Base de datos

### `database/schema.sql`

- Lineas 1 a 5: crean y seleccionan la base `chompas_mabel_db`.
- Lineas 7 a 13: eliminan procedimientos anteriores para que el script pueda ejecutarse varias veces.
- Lineas 15 a 24: eliminan tablas en orden seguro desactivando temporalmente claves foraneas.
- Lineas 26 a 34: tabla `usuarios`, usada para login y roles.
- Lineas 36 a 44: tabla `clientes`.
- Lineas 46 a 51: tabla `categorias`.
- Lineas 53 a 69: tabla `productos`, con precio, stock y relacion a categoria.
- Lineas 71 a 93: tabla `pedidos`, incluye total, metodo de pago y campos de credito.
- Lineas 94 a 108: tabla `detalle_pedido`, relaciona pedidos con productos.
- Lineas 110 a 119: tabla `ventas`, registra ventas cerradas.
- Lineas 121 a 131: tabla `inventario_movimientos`, registra entradas, salidas y ajustes de stock.
- Lineas 133 a 180: datos iniciales para probar el sistema.
- Lineas 197 a 340: procedimientos almacenados para listar productos, clientes, pedidos, detalles, ventas, inventario y reportes.

Respuesta:

> La base esta normalizada porque separa clientes, productos, pedidos, detalles, ventas e inventario. Las relaciones permiten saber quien compro, que producto compro, cuanto debe y como se movio el stock.

## Respuestas rapidas si el docente apunta una linea

1. Si apunta un `import`:
   > Esa linea trae una clase o funcion externa para poder usarla en este archivo.

2. Si apunta un `signal`:
   > Guarda estado reactivo en Angular; cuando cambia, la pantalla se actualiza.

3. Si apunta un `computed`:
   > Calcula un dato derivado de otro estado, por ejemplo total de ventas o creditos vencidos.

4. Si apunta un `http.get`, `http.post` o `http.patch`:
   > Es una llamada al backend. `GET` consulta, `POST` registra y `PATCH` actualiza parcialmente.

5. Si apunta un `@app.get` o `@app.post`:
   > Es una ruta del backend. Define que operacion se ejecuta cuando el frontend llama a esa URL.

6. Si apunta un `Field(...)` en FastAPI:
   > Es una validacion de entrada. Evita guardar datos incorrectos.

7. Si apunta un `FOREIGN KEY`:
   > Es una relacion entre tablas y mantiene integridad referencial.

8. Si apunta un `CHECK`:
   > Es una regla de base de datos para evitar valores invalidos, como stock negativo.

9. Si apunta `call_proc`:
   > Ejecuta un procedimiento almacenado de MySQL y devuelve el resultado como JSON.

10. Si apunta `localStorage`:
    > Guarda temporalmente token, usuario y rol para mantener la sesion en el navegador.

## Frase final para defensa

> Puedo explicar el codigo por partes: rutas, componentes, servicios, backend y base de datos. Si se senala una linea especifica, primero identifico si es importacion, estado, validacion, consulta, endpoint o relacion de base de datos, y desde ahi explico su funcion dentro del flujo del sistema.
