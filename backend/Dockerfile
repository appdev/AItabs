# ---- 依赖安装阶段 ----
FROM oven/bun:latest AS install

WORKDIR /app

# 先复制依赖描述文件，利用 Docker 层缓存
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- 运行阶段 ----
FROM oven/bun:latest AS runner

WORKDIR /app

# 只复制运行所需文件
COPY --from=install /app/node_modules ./node_modules
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts tsconfig.json ./
COPY package.json ./

# 创建数据目录（会被 volume 覆盖，此处保证目录存在）
RUN mkdir -p /app/data

# SQLite 数据文件持久化挂载点
VOLUME ["/app/data"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# 启动时自动执行迁移，再启动服务
CMD ["sh", "-c", "bun src/db/migrate.ts && bun src/index.ts"]
