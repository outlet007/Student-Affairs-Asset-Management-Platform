# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# ---- Production Stage ----
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8021

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8021/login || exit 1

# Start application
CMD ["node", "app.js"]
