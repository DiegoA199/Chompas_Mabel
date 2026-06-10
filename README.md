# Chompas Mabel - Sistema Web de Gestion

Sistema web para administrar una empresa de chompas: login, dashboard, productos, inventario, clientes, pedidos, ventas, creditos y reportes.

## Tecnologias

- Frontend: Angular 21, TypeScript, Bootstrap 5, Bootstrap Icons, CSS propio, routing, servicios HTTP, formularios reactivos y signals para estados de interfaz.
- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, Hibernate, validaciones con `jakarta.validation`, controladores REST, servicios, repositorios, DTOs y modelos JPA.
- Base de datos: MySQL 8.4 con script reproducible en `database/schema.sql`.
- Docker: `docker-compose.yml` levanta MySQL y tambien puede construir el backend con `backend-springboot/Dockerfile`.

## Estructura final

```text
Chompas_Mabel_Real_Angular_SpringBoot/
|-- frontend-angular/
|   |-- src/
|   |   |-- app/
|   |   |   |-- core/
|   |   |   |   |-- models/
|   |   |   |   |   |-- cliente.model.ts
|   |   |   |   |   |-- pedido.model.ts
|   |   |   |   |   +-- producto.model.ts
|   |   |   |   +-- services/
|   |   |   |       |-- auth.interceptor.ts
|   |   |   |       |-- auth.service.ts
|   |   |   |       |-- cliente.service.ts
|   |   |   |       |-- environment.ts
|   |   |   |       |-- pedido.service.ts
|   |   |   |       +-- producto.service.ts
|   |   |   |-- features/
|   |   |   |   |-- auth/login.component.ts
|   |   |   |   |-- clientes/clientes.component.ts
|   |   |   |   |-- dashboard/dashboard.component.ts
|   |   |   |   |-- creditos/creditos.component.ts
|   |   |   |   |-- pedidos/pedidos.component.ts
|   |   |   |   |-- productos/productos.component.ts
|   |   |   |   +-- reportes/reportes.component.ts
|   |   |   |-- layout/layout.component.ts
|   |   |   |-- app.component.ts
|   |   |   +-- app.routes.ts
|   |   |-- assets/logo.svg
|   |   |-- index.html
|   |   |-- main.ts
|   |   +-- styles.css
|   |-- angular.json
|   |-- package.json
|   |-- package-lock.json
|   |-- tsconfig.json
|   +-- README.md
|-- backend-springboot/
|   |-- src/main/java/pe/edu/continental/chompasmabel/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- model/
|   |   |-- repository/
|   |   |-- service/
|   |   +-- ChompasMabelApiApplication.java
|   |-- src/main/resources/
|   |   |-- application.yml
|   |   +-- data.sql
|   |-- Dockerfile
|   |-- pom.xml
|   +-- README.md
|-- database/schema.sql
|-- docs/
|   |-- entregables/
|   +-- imagenes/
|-- docker-compose.yml
+-- README.md
```

## Requisitos

- Docker Desktop
- Java 21
- Maven 3.9+
- Node.js 22+
- npm

## Ejecucion local

Desde la raiz del proyecto, levanta MySQL:

```bash
docker compose up -d mysql
```

La base creada es `chompas_mabel_db` y se inicializa con `database/schema.sql`.

En otra terminal ejecuta el backend:

```bash
cd backend-springboot
mvn spring-boot:run
```

En otra terminal ejecuta el frontend:

```bash
cd frontend-angular
npm install
npm start
```

Abrir: `http://localhost:4200`

## Ejecucion con Docker

Para levantar MySQL y construir el backend:

```bash
docker compose up --build
```

El frontend se ejecuta con Angular CLI desde `frontend-angular`.

## Credenciales demo

- Administrador: `admin@chompasmabel.com` / `admin123`
- Vendedor: `vendedor@chompasmabel.com` / `venta123`

## API principal

- `POST http://localhost:8080/api/auth/login`
- `GET http://localhost:8080/api/productos`
- `POST http://localhost:8080/api/productos`
- `PUT http://localhost:8080/api/productos/{id}`
- `DELETE http://localhost:8080/api/productos/{id}`
- `GET http://localhost:8080/api/clientes`
- `POST http://localhost:8080/api/clientes`
- `GET http://localhost:8080/api/pedidos`
- `POST http://localhost:8080/api/pedidos`
- `PATCH http://localhost:8080/api/pedidos/{id}/credito/pagar`

## Modelo de datos

- Categoria 1 a N Productos
- Cliente 1 a N Pedidos
- Usuario 1 a N Pedidos
- Pedido 1 a N DetallePedido
- Producto 1 a N DetallePedido
- Producto 1 a N InventarioMovimiento
- Pedido 1 a 1 Venta

Las tablas reales del script son `usuarios`, `clientes`, `categorias`, `productos`, `pedidos`, `detalle_pedido`, `ventas` e `inventario_movimientos`.

La tabla `pedidos` tambien guarda datos de credito: `monto_pagado`, `saldo_pendiente`, `fecha_vencimiento_credito` y `estado_credito`. Con eso se puede saber que cliente llevo productos a credito, cuanto debe, cuando vence y si el saldo ya fue pagado.

## Replicar en otra PC

El enlace del repositorio se puede copiar desde GitHub o descargar usando GitHub Desktop.

```bash
git clone URL_DEL_REPOSITORIO
cd Chompas_Mabel_Real_Angular_SpringBoot
docker compose up -d mysql
```

Luego ejecuta el backend y frontend con los comandos anteriores. No subas `node_modules`, `dist`, `target` ni datos locales de MySQL; `database/schema.sql` y `docker-compose.yml` recrean la base con datos iniciales.

## Notas de implementacion

- El frontend consume el backend mediante servicios HTTP en `src/app/core/services`.
- Los formularios validan campos obligatorios, correo valido, precio y stock mayores o iguales a 0, cantidad mayor a 0 y nombre minimo de 3 caracteres.
- El backend valida payloads con `jakarta.validation` y responde errores JSON desde `ApiExceptionHandler`.
- Al registrar un pedido, el backend calcula subtotales, total, descuenta stock, registra movimientos de inventario y genera venta cuando el estado corresponde.
- Si el metodo de pago es `Credito`, el backend calcula saldo pendiente, fecha de vencimiento y estado `PENDIENTE`, `VENCIDO` o `PAGADO`.
