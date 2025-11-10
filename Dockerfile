# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies separately for caching
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --omit=dev && npm cache clean --force

# Build stage (not much build for plain JS, but placeholder)
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm prune --omit=dev

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Add a non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /app .
EXPOSE 4000
CMD ["node", "src/server.js"]
