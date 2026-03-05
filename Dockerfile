# 多阶段构建：Node 构建 + Nginx 服务静态文件

# ---- 构建阶段 ----
FROM node:22-alpine AS builder

WORKDIR /app

# 先复制依赖描述文件，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# 再复制源码并构建
COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM nginx:alpine AS runner

# 移除默认页面
RUN rm -rf /usr/share/nginx/html/*

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 路由支持：所有路径回退到 index.html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
