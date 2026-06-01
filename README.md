# Chompas Mabel - Sistema Web de Gestion

Sistema web real para gestionar una empresa de chompas: login, dashboard, productos, inventario, clientes, pedidos, ventas y reportes.

## Tecnologias

- Frontend: Angular 21, TypeScript, Bootstrap 5, CSS propio, routing, servicios HTTP, signals y formularios reactivos.
- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Hibernate, validaciones con `jakarta.validation`, controladores REST, servicios, repositorios y modelos.
- Base de datos: MySQL 8.4 con `database/schema.sql`.
- Docker: `docker-compose.yml` levanta MySQL y permite conectar el backend.

## Requisitos

- Docker Desktop
- Java 21
- Maven 3.9+
- Node.js 22+
- npm

## Replicar en otra PC

Sube este proyecto a GitHub y en la otra PC ejecuta:
 se puede encontrar en el inicio del repositorio o puedes descargar el panel de desktop de git hub en tu computadora mas facil

 
```bash
git clone URL_DEL_REPOSITORIO
cd Chompas_Mabel_Real_Angular_SpringBoot
docker compose up -d mysql
```

Luego abre dos terminales:

```bash
cd backend-springboot
mvn spring-boot:run
```

```bash
cd frontend-angular
npm install
npm start
```

No subas `node_modules`, `dist`, `target` ni datos locales de MySQL. El archivo `database/schema.sql` y `docker-compose.yml` son suficientes para recrear la base `chompas_mabel_db` con datos iniciales.

## 1. Levantar MySQL

Desde la raiz del proyecto:

```bash
docker compose up -d mysql
```

La base creada es `chompas_mabel_db` y se inicializa con `database/schema.sql`.

Si necesitas reconstruir la base desde cero:

```bash
docker compose down -v
docker compose up -d mysql
```

## 2. Ejecutar backend

```bash
cd backend-springboot
mvn spring-boot:run
```

API principal:

- `GET http://localhost:8080/api/productos`
- `POST http://localhost:8080/api/productos`
- `PUT http://localhost:8080/api/productos/{id}`
- `DELETE http://localhost:8080/api/productos/{id}`
- `GET http://localhost:8080/api/clientes`
- `POST http://localhost:8080/api/clientes`
- `GET http://localhost:8080/api/pedidos`
- `POST http://localhost:8080/api/pedidos`
- `POST http://localhost:8080/api/auth/login`

## 3. Ejecutar frontend

```bash
cd frontend-angular
npm install
npm start
```

Abrir: `http://localhost:4200`

## Credenciales demo

- Administrador: `admin@chompasmabel.com` / `admin123`
- Vendedor: `vendedor@chompasmabel.com` / `venta123`

## Modelo de datos

- Categoria 1 a N Productos
- Cliente 1 a N Pedidos
- Usuario 1 a N Pedidos
- Pedido 1 a N DetallePedido
- Producto 1 a N DetallePedido
- Producto 1 a N InventarioMovimiento
- Pedido 1 a 1 Venta

## Notas de implementacion

- El frontend consume el backend mediante servicios HTTP en `src/app/core/services`.
- Los formularios validan campos obligatorios, correo valido, precio y stock mayores o iguales a 0, cantidad mayor a 0 y nombre minimo de 3 caracteres.
- El backend valida payloads con `jakarta.validation` y responde errores JSON desde `ApiExceptionHandler`.
- Al registrar un pedido, el backend calcula subtotales, total, descuenta stock, registra movimientos de inventario y genera venta cuando el estado corresponde.
