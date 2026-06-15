# Como Replicar la Base de Datos

Esta guia explica que debe hacer una persona cuando descarga o clona el proyecto en otra computadora.

## Idea principal

GitHub guarda el codigo del proyecto y el archivo SQL, pero no guarda una base de datos corriendo.

El archivo importante es:

```text
database/schema.sql
```

Ese script crea:

- La base de datos `chompas_mabel_db`.
- Todas las tablas.
- Relaciones y restricciones.
- Procedimientos almacenados para consultas de productos, clientes, pedidos, ventas, inventario y reportes.
- Datos iniciales para probar login, productos, clientes, pedidos, ventas, inventario y creditos.

Por eso, despues de clonar el proyecto, se debe ejecutar o importar `database/schema.sql` una sola vez en MySQL.

## Requisitos

En la computadora donde se va a replicar el proyecto se necesita una de estas opciones:

- MySQL Server + MySQL Workbench.
- XAMPP con MySQL/phpMyAdmin.
- MySQL instalado y disponible por consola.
- Docker Desktop, si se quiere levantar MySQL automaticamente.

Para exposicion, la opcion mas facil de mostrar visualmente es MySQL Workbench.

## Paso 1: Clonar el proyecto

```bash
git clone https://github.com/DiegoA199/Chompas_Mabel.git
cd Chompas_Mabel
```

Si se descarga como ZIP desde GitHub, se debe descomprimir y abrir la carpeta del proyecto.

## Paso 2: Crear la base de datos

### Opcion A: MySQL Workbench

1. Abrir MySQL Workbench.
2. Conectarse al servidor local de MySQL.
3. Abrir el archivo `database/schema.sql`.
4. Ejecutar todo el script con el boton de rayo.
5. Refrescar la seccion `SCHEMAS`.
6. Verificar que exista la base:

```text
chompas_mabel_db
```

### Opcion B: XAMPP/phpMyAdmin

1. Abrir XAMPP.
2. Iniciar MySQL.
3. Entrar a:

```text
http://localhost/phpmyadmin
```

4. Ir a `Importar`.
5. Seleccionar `database/schema.sql`.
6. Ejecutar la importacion.
7. Verificar que aparezca `chompas_mabel_db`.

### Opcion C: Consola MySQL

Desde la raiz del proyecto:

```bash
mysql -u root -p < database/schema.sql
```

Luego se puede entrar a MySQL para verificar:

```bash
mysql -u root -p
```

Dentro de MySQL:

```sql
SHOW DATABASES;
USE chompas_mabel_db;
SHOW TABLES;
```

### Opcion D: Docker

Desde la raiz del proyecto:

```bash
docker compose up -d mysql
```

Docker crea MySQL y carga automaticamente `database/schema.sql`.

## Paso 3: Verificar las tablas

La base debe tener estas tablas:

```text
usuarios
clientes
categorias
productos
pedidos
detalle_pedido
ventas
inventario_movimientos
```

Consultas utiles:

```sql
USE chompas_mabel_db;
SELECT * FROM usuarios;
SELECT * FROM productos;
SELECT * FROM clientes;
SELECT * FROM pedidos;
SELECT * FROM ventas;
SHOW PROCEDURE STATUS WHERE Db = 'chompas_mabel_db';
CALL sp_resumen_reportes();
```

Para ver creditos:

```sql
SELECT numero, metodo_pago, total, monto_pagado, saldo_pendiente, fecha_vencimiento_credito, estado_credito
FROM pedidos
WHERE metodo_pago = 'Credito';
```

## Paso 4: Conectar el backend

El backend principal para la rubrica esta en `backend-fastapi` y ya esta configurado para conectarse a MySQL local con estos datos:

```text
Host: localhost
Puerto: 3306
Base: chompas_mabel_db
Usuario: root
Password: root
```

Si se ejecuta con Docker, el servicio FastAPI usa el host interno `mysql`.

La configuracion del backend Spring Boot alternativo esta en:

```text
backend-springboot/src/main/resources/application.yml
```

Si MySQL usa otra contrasena, antes de correr el backend FastAPI se debe configurar:

```powershell
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="TU_PASSWORD"
```

Si XAMPP usa root sin contrasena:

```powershell
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD=""
```

Para el backend Spring Boot alternativo se usan `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`.

## Paso 5: Ejecutar backend y frontend

Backend principal FastAPI:

```bash
cd backend-fastapi
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend Spring Boot alternativo:

```bash
cd backend-springboot
mvn spring-boot:run
```

Frontend:

```bash
cd frontend-angular
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

El frontend consume por defecto:

```text
http://localhost:8000/api
```

## Credenciales de prueba

```text
Administrador: admin@chompasmabel.com / admin123
Vendedor: vendedor@chompasmabel.com / venta123
```

## Nota para despliegue futuro

Cuando el proyecto se despliegue en Render u otro hosting, el proceso sera parecido:

1. Crear una base MySQL en la nube.
2. Ejecutar `database/schema.sql` en esa base.
3. Configurar el backend FastAPI con variables de entorno:

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
```

4. Cambiar el frontend para consumir la URL publica del backend.

En resumen: GitHub guarda el script, pero la base real debe crearse en MySQL local, Docker o un proveedor en la nube.
