# Backend Spring Boot - Chompas Mabel

API REST construida con Java 21 y Spring Boot para productos, clientes, pedidos, ventas, creditos, inventario y autenticacion demo.

## Estructura

```text
src/main/java/pe/edu/continental/chompasmabel/
|-- config/
|-- controller/
|-- dto/
|-- model/
|-- repository/
|-- service/
+-- ChompasMabelApiApplication.java
```

## Comandos

```bash
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080/api`.

## Base de datos

El backend se conecta a MySQL con las variables configuradas en `src/main/resources/application.yml`. En desarrollo local, la base se crea desde `../database/schema.sql` al levantar MySQL con Docker Compose:

```bash
docker compose up -d mysql
```

Credenciales por defecto:

- Base: `chompas_mabel_db`
- Usuario: `root`
- Password: `root`

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

## Creditos

Cuando un pedido se registra con metodo de pago `Credito`, el backend guarda `montoPagado`, `saldoPendiente`, `fechaVencimientoCredito` y `estadoCredito`. Si el saldo sigue pendiente despues de la fecha de vencimiento, la respuesta marca el credito como vencido.
