# Despliegue en Render - Chompas Mabel

Esta guia explica como subir el proyecto a Render con un solo dominio.

## Resultado esperado

Render levanta un Web Service Docker.

```text
https://tu-app.onrender.com          -> Angular
https://tu-app.onrender.com/api/...  -> FastAPI
```

Si agregas un dominio propio:

```text
https://tudominio.com          -> Angular
https://tudominio.com/api/...  -> FastAPI
```

## Archivos preparados

- `Dockerfile`: construye Angular y FastAPI en una sola imagen.
- `render.yaml`: Blueprint para crear el Web Service en Render.
- `.dockerignore`: evita subir archivos innecesarios al build.
- `backend-fastapi/app/main.py`: sirve API y frontend.
- `frontend-angular/src/app/core/config/environment.ts`: usa `localhost:8000` en local y `/api` en produccion.

## Base de datos MySQL

El proyecto usa MySQL. Antes de desplegar la app necesitas una base MySQL accesible desde Render.

Opciones:

- Crear MySQL como private service en Render con disco persistente.
- Usar un proveedor externo compatible con MySQL.
- Usar un servidor MySQL propio que acepte conexiones desde Render.

Despues ejecuta el script:

```bash
mysql -h HOST -P 3306 -u USUARIO -p < database/schema.sql
```

Si la base MySQL esta dentro de Render como private service, puedes abrir la Shell del Web Service despues del primer despliegue y ejecutar:

```bash
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD < /app/database/schema.sql
```

## Variables de entorno

Puedes configurar la conexion con `MYSQL_URL`:

```text
MYSQL_URL=mysql://USUARIO:PASSWORD@HOST:3306/chompas_mabel_db
```

O con variables separadas:

```text
MYSQL_HOST=HOST
MYSQL_PORT=3306
MYSQL_DATABASE=chompas_mabel_db
MYSQL_USER=USUARIO
MYSQL_PASSWORD=PASSWORD
```

`render.yaml` deja esas variables como placeholders seguros para llenarlas desde el Dashboard.

## Despliegue con Blueprint

1. Sube el proyecto a GitHub.
2. En Render, crea un nuevo Blueprint.
3. Selecciona el repositorio.
4. Render detectara `render.yaml`.
5. Completa las variables de entorno de MySQL.
6. Lanza el despliegue.

Render usara:

```text
Dockerfile
healthCheckPath: /api/health
```

## Despliegue manual como Web Service

1. En Render, crea un nuevo Web Service.
2. Conecta el repositorio de GitHub.
3. Selecciona runtime `Docker`.
4. Usa el `Dockerfile` de la raiz.
5. Configura las variables de entorno de MySQL.
6. Despliega.

El contenedor usa el puerto que Render entrega en `PORT`.

## Dominio propio

1. En el servicio de Render, abre `Settings`.
2. En `Custom Domains`, agrega tu dominio.
3. Configura DNS en tu proveedor.
4. Verifica el dominio en Render.

No necesitas cambiar Angular para el dominio propio porque el frontend usa:

```text
window.location.origin + "/api"
```

## Pruebas despues de desplegar

Abre:

```text
https://tu-app.onrender.com/api/health
```

Debe responder:

```json
{"status":"ok","backend":"fastapi"}
```

Luego entra al dominio principal y prueba login:

```text
admin@chompasmabel.com / admin123
vendedor@chompasmabel.com / venta123
```

## Errores comunes

### Error de conexion a MySQL

Revisa `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`.

### Login no funciona

Verifica que ejecutaste `database/schema.sql` en la base de produccion.

### El frontend carga pero la API no

Prueba `/api/health`. Si falla, revisa logs del Web Service en Render.

### Rutas de Angular dan 404

El backend ya tiene fallback para servir `index.html`; si ocurre, revisa que el Docker build haya generado `frontend-angular/dist/chompas-mabel/browser`.
