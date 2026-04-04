# =====================================================
# 1️⃣ Build Stage
# =====================================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy เฉพาะไฟล์ที่จำเป็นก่อน (เพื่อใช้ layer cache ให้คุ้ม)
COPY package.json package-lock.json ./

# ใช้ npm ci สำหรับ production
RUN npm ci

# Copy source code ทั้งหมด
COPY . .

# ---- Build-time ENV (จะถูก embed ลง JS) ----
ARG VITE_API_BASE_URL
ARG VITE_APP_VERSION
ARG VITE_PUBLIC_AUTH_URL
ARG VITE_PUBLIC_CLIENT_ID
ARG VITE_PUBLIC_CALLBACK_URL
ARG VITE_PUBLIC_SCOPE
ARG VITE_PUBLIC_LOGOUT_URL
ARG VITE_PUBLIC_BASICINFO_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_PUBLIC_AUTH_URL=$VITE_PUBLIC_AUTH_URL
ENV VITE_PUBLIC_CLIENT_ID=$VITE_PUBLIC_CLIENT_ID
ENV VITE_PUBLIC_CALLBACK_URL=$VITE_PUBLIC_CALLBACK_URL
ENV VITE_PUBLIC_SCOPE=$VITE_PUBLIC_SCOPE
ENV VITE_PUBLIC_LOGOUT_URL=$VITE_PUBLIC_LOGOUT_URL
ENV VITE_PUBLIC_BASICINFO_URL=$VITE_PUBLIC_BASICINFO_URL

# Build
RUN npm run build


# =====================================================
# 2️⃣ Runtime Stage (เล็ก + ปลอดภัย)
# =====================================================
FROM nginx:1.28.2-alpine

# ลบ config default
RUN rm -rf /etc/nginx/conf.d/*

# Copy nginx config ของเรา
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy ไฟล์ build จาก stage แรก
COPY --from=builder /app/dist /var/www/html

# เปิด port
EXPOSE 80

# รัน nginx แบบ foreground
CMD ["nginx", "-g", "daemon off;"]
