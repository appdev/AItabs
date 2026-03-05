#!/usr/bin/env bash
set -euo pipefail

# AItabs 前端构建 + Nginx 预览脚本
# 用法：
#   ./restart.sh          # 构建并用 Docker 启动预览
#   ./restart.sh build    # 仅构建
#   ./restart.sh dev      # 启动开发服务器

PORT="${PORT:-3000}"
MODE="${1:-all}"

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

build() {
    log "开始构建..."
    npm run build
    log "构建完成，产物在 dist/"
}

start_preview() {
    log "停止旧容器（如果有）..."
    docker rm -f aitabs-preview 2>/dev/null || true

    log "启动 Nginx 预览（端口 ${PORT}）..."
    docker run -d \
        --name aitabs-preview \
        -p "${PORT}:80" \
        -v "$(pwd)/dist:/usr/share/nginx/html:ro" \
        nginx:alpine

    log "预览地址：http://localhost:${PORT}"
}

case "${MODE}" in
    build)
        build
        ;;
    dev)
        log "启动开发服务器..."
        npm run dev
        ;;
    all)
        build
        start_preview
        ;;
    *)
        echo "用法：$0 [build|dev|all]"
        exit 1
        ;;
esac
