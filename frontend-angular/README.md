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
|   +-- services/
|-- features/
|   |-- auth/
|   |-- clientes/
|   |-- creditos/
|   |-- dashboard/
|   |-- inventario/
|   |-- pedidos/
|   |-- productos/
|   |-- reportes/
|   +-- ventas/
|-- layout/
|-- app.component.ts
+-- app.routes.ts
```

Los componentes son standalone y usan plantillas embebidas en sus archivos `.component.ts`. Los estilos globales estan en `src/styles.css`.

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
