# Backend Spring Boot - Chompas Mabel

API REST construida con Java 21 y Spring Boot para productos, clientes, pedidos, ventas, creditos, inventario y autenticacion demo.

La autenticacion demo devuelve el identificador del usuario y su rol (`ADMIN` o `VENDEDOR`) para que el frontend adapte menu, permisos y flujo de trabajo.

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

El backend se conecta a MySQL con las variables configuradas en `src/main/resources/application.yml`. La base se puede crear con Docker o con MySQL local.

Con Docker Compose:

```bash
docker compose up -d mysql
```

Sin Docker, ejecuta el script completo en MySQL local:

```bash
mysql -u root -p < ../database/schema.sql
```

Tambien puedes abrir `../database/schema.sql` en MySQL Workbench y ejecutarlo completo, o importarlo desde phpMyAdmin si usas XAMPP.

Credenciales por defecto:

- Base: `chompas_mabel_db`
- Usuario: `root`
- Password: `root`

Si tu MySQL local usa otra contrasena, configura:

```powershell
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="TU_PASSWORD"
```

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
