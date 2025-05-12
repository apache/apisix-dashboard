FROM node:22-alpine AS base

# install deps
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  else echo 'Lockfile not found.' && exit 1; \
  fi

# build ui
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# we need git to get commit sha
RUN apk add --no-cache git
RUN corepack enable pnpm && pnpm build

# serve ui
FROM nginx:1.28.0-alpine-slim AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
