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
|   |-- replicar_base_datos.md
|   |-- requerimientos_usuario.md
|   +-- imagenes/
|-- docker-compose.yml
+-- README.md
```

## Requisitos

- Java 21
- Maven 3.9+
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

Si Docker demora o no sincroniza bien, instala MySQL Server o usa MySQL Workbench/XAMPP e importa el script completo:

```bash
mysql -u root -p < database/schema.sql
```

En MySQL Workbench tambien puedes abrir `database/schema.sql` y ejecutarlo con el boton de rayo. En XAMPP/phpMyAdmin puedes entrar a `http://localhost/phpmyadmin` e importar el mismo archivo.

El backend usa por defecto:

```text
Base: chompas_mabel_db
Usuario: root
Password: root
Puerto: 3306
```

Si tu MySQL tiene otra contrasena, configura las variables antes de correr el backend:

```powershell
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="TU_PASSWORD"
```

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

## Flujo por rol

- Administrador: dashboard administrativo, mantenimiento de productos, inventario, clientes, pedidos, ventas, creditos, reportes y notificaciones de stock bajo.
- Vendedor: dashboard operativo, catalogo visual de chompas para atencion al cliente, registro de clientes, pedidos, ventas, creditos y notificaciones de pedidos/creditos.

Los requerimientos de usuario estan documentados en `docs/requerimientos_usuario.md`.

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

El script completo de base de datos esta en `database/schema.sql` e incluye datos iniciales para probar administrador, vendedor, productos, clientes, pedidos, ventas, inventario y creditos.

La guia completa para crear, importar y verificar la base en otra PC esta en `docs/replicar_base_datos.md`.

## Replicar en otra PC

El enlace del repositorio se puede copiar desde GitHub o descargar usando GitHub Desktop.

```bash
git clone URL_DEL_REPOSITORIO
cd Chompas_Mabel_Real_Angular_SpringBoot
```

Luego elige una forma de crear la base:

Con Docker:

```bash
docker compose up -d mysql
```

Sin Docker, usando MySQL local:

```bash
mysql -u root -p < database/schema.sql
```

Despues ejecuta el backend y frontend con los comandos anteriores. No subas `node_modules`, `dist`, `target` ni datos locales de MySQL; `database/schema.sql` recrea toda la base con datos iniciales y `docker-compose.yml` queda como alternativa automatizada.

Para pasos detallados con MySQL Workbench, XAMPP/phpMyAdmin, consola MySQL y Docker, revisar `docs/replicar_base_datos.md`.

## Notas de implementacion

- El frontend consume el backend mediante servicios HTTP en `src/app/core/services`.
- La pantalla de productos cambia segun rol: administrador edita inventario y vendedor ve un catalogo responsive con imagenes, filtros, tallas, colores, precios y stock.
- Los formularios validan campos obligatorios, correo valido, precio y stock mayores o iguales a 0, cantidad mayor a 0 y nombre minimo de 3 caracteres.
- El backend valida payloads con `jakarta.validation` y responde errores JSON desde `ApiExceptionHandler`.
- Al registrar un pedido, el backend calcula subtotales, total, descuenta stock, registra movimientos de inventario y genera venta cuando el estado corresponde.
- Si el metodo de pago es `Credito`, el backend calcula saldo pendiente, fecha de vencimiento y estado `PENDIENTE`, `VENCIDO` o `PAGADO`.
- La campana de notificaciones calcula alertas reales segun creditos vencidos, pedidos pendientes y stock bajo.
