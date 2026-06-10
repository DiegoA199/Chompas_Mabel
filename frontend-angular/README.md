# Frontend Angular - Chompas Mabel

Aplicacion web SPA construida con Angular 21 para los modulos de login, dashboard, productos, clientes, pedidos/ventas, creditos y reportes.

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
|   |-- pedidos/
|   |-- productos/
|   +-- reportes/
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

Los servicios HTTP estan en `src/app/core/services` y consumen el backend Spring Boot en `http://localhost:8080/api`.

El modulo de creditos usa `PedidoService` para listar pedidos a credito, mostrar saldos vencidos y marcar una cuenta como pagada.
