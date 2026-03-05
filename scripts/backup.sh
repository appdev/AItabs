#!/usr/bin/env bash
set -euo pipefail

# AItabs 数据库备份脚本
# 将 aitabs.db 复制到 backups/ 目录，保留最近 7 份

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"

DB_FILE="${DB_PATH:-${PROJECT_DIR}/data/aitabs.db}"
BACKUP_DIR="${PROJECT_DIR}/backups"
MAX_BACKUPS=7

# 检查数据库文件是否存在
if [[ ! -f "${DB_FILE}" ]]; then
  echo "错误：数据库文件不存在：${DB_FILE}" >&2
  exit 1
fi

# 确保备份目录存在
mkdir -p "${BACKUP_DIR}"

# 生成带时间戳的备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/aitabs_${TIMESTAMP}.db"

# 执行备份
cp "${DB_FILE}" "${BACKUP_FILE}"
echo "备份成功：${BACKUP_FILE}"

# 只保留最近 MAX_BACKUPS 份，删除多余的旧备份
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/aitabs_*.db 2>/dev/null | wc -l)
if [[ ${BACKUP_COUNT} -gt ${MAX_BACKUPS} ]]; then
  DELETE_COUNT=$(( BACKUP_COUNT - MAX_BACKUPS ))
  ls -1t "${BACKUP_DIR}"/aitabs_*.db | tail -n "${DELETE_COUNT}" | while read -r old_file; do
    rm -f "${old_file}"
    echo "清理旧备份：${old_file}"
  done
fi

echo "当前备份数量：$(ls -1 "${BACKUP_DIR}"/aitabs_*.db 2>/dev/null | wc -l)/${MAX_BACKUPS}"
