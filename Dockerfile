# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/buyer-app/package.json ./apps/buyer-app/
COPY apps/seller-app/package.json ./apps/seller-app/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install -no-frozen-lockfile

# Copy source code
COPY tsconfig.base.json ./
COPY apps/buyer-app ./apps/buyer-app
COPY apps/seller-app ./apps/seller-app
COPY packages/shared ./packages/shared

# Build applications
RUN pnpm --filter @steellink/shared build || true
RUN pnpm --filter @steellink/buyer-app build
RUN pnpm --filter @steellink/seller-app build

# Production stage
FROM nginx:alpine

# Default API upstream for containerized deployments; override at runtime when needed.
ENV API_UPSTREAM=http://backend:8080

# Copy nginx configuration template
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets
COPY --from=builder /app/apps/buyer-app/dist /usr/share/nginx/html/buyer
COPY --from=builder /app/apps/seller-app/dist /usr/share/nginx/html/seller

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
