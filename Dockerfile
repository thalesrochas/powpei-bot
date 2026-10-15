# syntax=docker/dockerfile:1

# ---- build: compila TypeScript -> dist/ ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime: só dependências de produção + JS compilado ----
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/dist ./dist
# A imagem oficial já traz o usuário "node" (uid 1000), o mesmo uid do usuário do Pi.
RUN mkdir -p logs && chown node:node logs
USER node
CMD ["node", "dist/index.js"]
