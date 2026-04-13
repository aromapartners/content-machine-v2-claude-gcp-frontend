FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install express
COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 8080
CMD ["node", "server.js"]
