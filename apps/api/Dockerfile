FROM node:24-alpine AS base

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM base AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3001
CMD ["node", "dist/index.js"]
