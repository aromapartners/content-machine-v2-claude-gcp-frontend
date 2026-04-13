# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (Dùng Nginx cho nhẹ và nhanh)
FROM nginx:alpine

# Copy file build từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Tạo file script để inject biến môi trường vào config.js khi khởi động
RUN echo '#!/bin/sh' > /docker-entrypoint.d/30-inject-env.sh && \
    echo 'echo "window.__RUNTIME_CONFIG__={BACKEND_URL:\"${BACKEND_URL}\"};" > /usr/share/nginx/html/config.js' >> /docker-entrypoint.d/30-inject-env.sh && \
    chmod +x /docker-entrypoint.d/30-inject-env.sh

# Cấu hình Nginx để lắng nghe port của Cloud Run
RUN sed -i 's/listen  80;/listen ${PORT};/' /etc/nginx/conf.d/default.conf

# Cloud Run tự động truyền biến PORT vào môi trường
ENV PORT=8080

CMD ["nginx", "-g", "daemon off;"]
