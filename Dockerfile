# Usar imagen oficial de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias (incluye devDependencies)
RUN npm ci --include=dev

# Copiar código fuente
COPY . .

# Construir aplicación React
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "server.js"]
