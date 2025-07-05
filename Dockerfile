# ---------- build stage ----------
FROM node:alpine AS builder 
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci                       

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# ---------- production stage ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar artefactos compilados
COPY --from=builder /app/dist .

# Reemplazar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 