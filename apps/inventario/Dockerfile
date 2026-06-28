FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nest build contracts && npm run build:inventario

FROM node:22-alpine AS runtime

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist/apps/inventario ./dist/apps/inventario
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

# Worker NATS — no expone puerto HTTP
CMD ["node", "dist/apps/inventario/apps/inventario/src/main"]
