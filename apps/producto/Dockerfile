FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:producto

FROM node:22-alpine AS runtime

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist/apps/producto ./dist/apps/producto
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

EXPOSE 3000

CMD ["node", "dist/apps/producto/main"]
