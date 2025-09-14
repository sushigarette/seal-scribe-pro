# Multi-stage build pour l'application complète
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY tsconfig*.json ./

RUN npm run build

# Stage backend
FROM python:3.11-slim

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN useradd -m -u 1000 certmanager && \
    mkdir -p /app /data/certs && \
    chown -R certmanager:certmanager /app /data/certs

WORKDIR /app

# Copie des fichiers de dépendances Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code backend
COPY backend/app/ ./app/

# Copie du frontend buildé
COPY --from=frontend-builder /app/frontend/dist ./static

# Configuration des permissions
RUN chown -R certmanager:certmanager /app

# Changement vers l'utilisateur non-root
USER certmanager

# Variables d'environnement par défaut
ENV CERTS_DIR=/data/certs
ENV PORT=8080
ENV HOST=0.0.0.0
ENV SCAN_INTERVAL_SEC=300
ENV THRESHOLD_DAYS=30

# Exposition du port
EXPOSE 8080

# Commande de démarrage
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
