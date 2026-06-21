# Frontend Angular - Chompas Mabel

Aplicacion web SPA construida con Angular 21 para los modulos de login, dashboard, productos, clientes, pedidos/ventas, creditos y reportes.

El frontend separa el flujo por rol:

- `ADMIN`: ve inventario, reportes y acciones de mantenimiento.
- `VENDEDOR`: ve operacion diaria, catalogo de consulta, clientes, pedidos, ventas y creditos.

## Estructura

```text
src/app/
|-- core/
|   |-- models/
|   |-- services/
|   |-- interceptors/
|   |-- guards/
|   +-- config/
|-- shared/
|   |-- components/
|   |-- pipes/
|   +-- directives/
|-- features/
|   |-- auth/
|   |   |-- login.component.ts
|   |   |-- login.component.html
|   |   |-- login.component.css
|   |   +-- auth.routes.ts
|   +-- productos/
|       |-- productos.component.ts
|       |-- productos.component.html
|       |-- productos.component.css
|       +-- productos.routes.ts
|-- layout/
|-- app.component.ts
|-- app.component.html
|-- app.component.css
|-- app.config.ts
+-- app.routes.ts
```

Los componentes son standalone y separan logica, plantilla y estilos en archivos `.component.ts`, `.component.html` y `.component.css`. Cada feature tiene su archivo `.routes.ts`. Los estilos globales estan en `src/styles.css`.

## Comandos

```bash
npm install
npm start
```

Abrir `http://localhost:4200`.

## Conexion API

Los servicios HTTP estan en `src/app/core/services`. En desarrollo consumen el backend FastAPI en `http://localhost:8000/api`; en produccion usan el mismo dominio publicado y agregan `/api`.

El modulo de creditos usa `PedidoService` para listar pedidos a credito, mostrar saldos vencidos y marcar una cuenta como pagada.

La campana de notificaciones se calcula con datos reales de `PedidoService` y `ProductoService`.
