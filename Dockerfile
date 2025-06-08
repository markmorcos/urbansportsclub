FROM mcr.microsoft.com/playwright:v1.52.0-jammy AS base
WORKDIR /app

FROM base AS dependencies
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./
COPY src ./src
COPY tsconfig.json ./

RUN npm run build

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
