FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend-angular/package*.json ./
RUN npm ci
COPY frontend-angular/ ./
RUN npm run build

FROM python:3.12-slim AS app
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV FRONTEND_DIST=/app/static

COPY backend-fastapi/requirements.txt ./requirements.txt
RUN apt-get update \
    && apt-get install -y --no-install-recommends default-mysql-client \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

COPY backend-fastapi/app ./app
COPY backend-fastapi/main.py ./main.py
COPY database/schema.sql ./database/schema.sql
COPY --from=frontend-build /frontend/dist/chompas-mabel/browser ./static

EXPOSE 10000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
