# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock* ./
RUN npm install

# Copy application code
COPY . .

# Build Vite frontend and bundle server.ts with esbuild into dist/server.cjs
RUN npm run build

# Remove development dependencies to keep final image small
RUN npm prune --omit=dev

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install tini for graceful PID 1 signal forwarding
RUN apk add --no-cache tini

# Copy necessary runtime artifacts from builder
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Run as non-root user
USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1

# Use tini entrypoint to handle SIGTERM/SIGINT cleanly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.cjs"]
