# Multi-stage production Dockerfile for Incredible India Travel Platform
# Requires Node.js 22+ for native node:sqlite DatabaseSync support

# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and config
COPY . .

# Build client assets and server bundle
RUN npm run build

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0
ENV YATRA_DATA_DIR=/app/data

# Create data directory for SQLite storage
RUN mkdir -p /app/data

# Copy built artifacts and package manifest
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 5173

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5173/api/health || exit 1

# Start the Node.js production server
CMD ["node", "dist/server.cjs"]
