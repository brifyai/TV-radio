# Usar imagen oficial de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Instalar dependencias de desarrollo para build
RUN npm ci --only=dev

# Construir aplicación React
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "server.js"]
