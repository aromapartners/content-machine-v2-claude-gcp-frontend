FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve@14

# Copy dist từ stage builder
COPY --from=builder /app/dist /app/dist

# Khai báo PORT mặc định (Cloud Run sẽ ghi đè cái này)
ENV PORT=8080
EXPOSE 8080

# SỬA LỖI TẠI ĐÂY: 
# 1. Đảm bảo file config.js được tạo ra đúng vị trí
# 2. Sử dụng biến $PORT thay vì fix cứng 8080
# 3. Sử dụng đường dẫn tuyệt đối cho serve
CMD ["sh", "-c", "echo \"window.__RUNTIME_CONFIG__={BACKEND_URL:'\"$BACKEND_URL\"'};\" > /app/dist/config.js && serve -s /app/dist -l $PORT"]
