FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
# Ensure config.js exists in dist (Vite copies from public/, but just in case)
RUN echo 'window.__RUNTIME_CONFIG__={BACKEND_URL:""};' > /app/dist/config.js

FROM node:20-alpine
RUN npm install -g serve@14
COPY --from=builder /app/dist /app/dist

EXPOSE 8080

# Use sh -c so ${BACKEND_URL} is expanded at runtime
CMD sh -c 'echo "window.__RUNTIME_CONFIG__={BACKEND_URL:\"${BACKEND_URL}\"};" > /app/dist/config.js && echo "Config: BACKEND_URL=${BACKEND_URL}" && exec serve -s /app/dist -l 8080'
