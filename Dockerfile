# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

# Copy server file
COPY server.js .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
