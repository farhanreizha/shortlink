FROM node:24-alpine AS base

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @knot/shared build
RUN pnpm --filter api build
RUN pnpm --filter api deploy --prod /app/deploy

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/deploy ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
