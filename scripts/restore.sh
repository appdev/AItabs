#!/usr/bin/env bash
set -euo pipefail

# AItabs 数据库恢复脚本
# 用法：./scripts/restore.sh <备份文件路径>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"

DB_FILE="${DB_PATH:-${PROJECT_DIR}/data/aitabs.db}"

# 检查参数
if [[ $# -lt 1 ]]; then
  echo "用法：$0 <备份文件路径>"
  echo ""
  echo "可用备份："
  ls -1t "${PROJECT_DIR}/backups"/aitabs_*.db 2>/dev/null || echo "  （无备份文件）"
  exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "错误：备份文件不存在：${BACKUP_FILE}" >&2
  exit 1
fi

echo "即将恢复："
echo "  备份文件：${BACKUP_FILE}"
echo "  目标位置：${DB_FILE}"
echo ""
read -r -p "确认恢复？当前数据将被覆盖（y/N）：" CONFIRM

if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
  echo "已取消。"
  exit 0
fi

# 恢复前先备份当前数据库（以防误操作）
if [[ -f "${DB_FILE}" ]]; then
  PRE_RESTORE="${DB_FILE}.pre-restore.$(date +%Y%m%d_%H%M%S)"
  cp "${DB_FILE}" "${PRE_RESTORE}"
  echo "当前数据库已备份至：${PRE_RESTORE}"
fi

# 确保目标目录存在
mkdir -p "$(dirname "${DB_FILE}")"

# 执行恢复
cp "${BACKUP_FILE}" "${DB_FILE}"
echo "恢复成功：${DB_FILE}"
