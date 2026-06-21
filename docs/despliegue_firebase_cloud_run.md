# Despliegue con Firebase, Cloud Run y Cloud SQL

Esta ruta usa Firebase Hosting como dominio con HTTPS, Cloud Run para ejecutar el Docker de FastAPI + Angular y Cloud SQL MySQL para conservar una base de datos relacional.

## Arquitectura

```text
Usuario
  -> Firebase Hosting / dominio
  -> Cloud Run: contenedor Docker del proyecto
     -> FastAPI /api
     -> Angular compilado
  -> Cloud SQL MySQL
```

No se recomienda migrar a Firestore para esta entrega porque el proyecto ya cumple mejor la rubrica con MySQL, relaciones, restricciones y procedimientos almacenados.

## 1. Crear el proyecto

1. Entra a Firebase Console y crea un proyecto.
2. Usa el mismo proyecto en Google Cloud Console.
3. Activa facturacion porque Cloud SQL necesita billing.
4. Instala Firebase CLI y Google Cloud CLI.

```bash
npm install -g firebase-tools
firebase login
gcloud auth login
gcloud config set project TU_PROJECT_ID
```

## 2. Crear Cloud SQL MySQL

En Google Cloud Console:

1. SQL > Crear instancia > MySQL.
2. Nombre sugerido: `chompas-mabel-db`.
3. Region sugerida: `us-central1`.
4. Version: MySQL 8.
5. Crea la base `chompas_mabel_db`.
6. Crea un usuario, por ejemplo `chompas_user`, con una contrasena segura.

## 3. Importar la base de datos

En Cloud Shell:

```bash
git clone https://github.com/DiegoA199/Chompas_Mabel.git
cd Chompas_Mabel
gcloud sql connect chompas-mabel-db --user=chompas_user --database=chompas_mabel_db
```

Dentro de la consola MySQL:

```sql
source database/schema.sql;
SHOW TABLES;
SHOW PROCEDURE STATUS WHERE Db = 'chompas_mabel_db';
```

Si `SHOW TABLES` muestra tablas y `SHOW PROCEDURE STATUS` muestra procedimientos, la base ya esta cargada.

## 4. Desplegar el backend/frontend en Cloud Run

Desde la raiz del repositorio:

```bash
gcloud run deploy chompas-mabel \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances TU_PROJECT_ID:us-central1:chompas-mabel-db \
  --set-env-vars MYSQL_INSTANCE_CONNECTION_NAME=TU_PROJECT_ID:us-central1:chompas-mabel-db,MYSQL_DATABASE=chompas_mabel_db,MYSQL_USER=chompas_user,MYSQL_PASSWORD=TU_PASSWORD
```

Al terminar, Google mostrara una URL de Cloud Run. Prueba:

```text
https://URL_DE_CLOUD_RUN/api/health
```

Debe responder:

```json
{"status":"ok","backend":"fastapi"}
```

## 5. Conectar Firebase Hosting al servicio

El archivo `firebase.json` ya esta preparado para reenviar el dominio de Firebase al servicio `chompas-mabel` en `us-central1`.

Si cambiaste el nombre del servicio o la region, edita:

```json
"serviceId": "chompas-mabel",
"region": "us-central1"
```

Luego ejecuta:

```bash
firebase use TU_PROJECT_ID
firebase deploy --only hosting
```

Firebase te dara una URL parecida a:

```text
https://TU_PROJECT_ID.web.app
```

Esa URL debe abrir Angular y las llamadas `/api` deben llegar al backend en Cloud Run.

## 6. Dominio propio

En Firebase Console:

1. Hosting > Add custom domain.
2. Escribe tu dominio.
3. Copia los registros DNS que Firebase indique.
4. Pegalos en el panel donde compraste el dominio.
5. Espera la verificacion y el certificado SSL.

## 7. Variables importantes

Cloud Run debe tener estas variables:

```text
MYSQL_INSTANCE_CONNECTION_NAME=TU_PROJECT_ID:us-central1:chompas-mabel-db
MYSQL_DATABASE=chompas_mabel_db
MYSQL_USER=chompas_user
MYSQL_PASSWORD=TU_PASSWORD
```

No subas la contrasena real a GitHub. Debe quedarse solo en Cloud Run.

## 8. Checklist para la rubrica

- Aplicacion web: Angular + FastAPI funcionando desde una URL publica.
- Despliegue: Firebase Hosting + Cloud Run con HTTPS.
- Base de datos: Cloud SQL MySQL con tablas, relaciones y procedimientos cargados desde `database/schema.sql`.
- Git: cambios subidos a GitHub y commits visibles.
- Sustentacion: estudiar `docs/guia_estudio_codigo.md` y explicar esta arquitectura.
