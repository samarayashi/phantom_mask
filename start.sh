#!/bin/bash
set -e  # 添加錯誤檢查

# 檢查 Docker 守護進程是否運行
if ! docker info > /dev/null 2>&1; then
    echo "錯誤：Docker 守護進程未運行"
    echo "請先啟動 Docker Desktop 或 Docker 服務"
    exit 1
fi

# 檢查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "錯誤：找不到 .env 文件"
    echo "請根據 .env.example 創建 .env 文件"
    exit 1
fi

# 載入環境變量
source .env

# 停止現有容器
docker-compose down

# 檢查是否需要重新初始化
if [ "$1" = "--reinit" ]; then
    echo "重新初始化數據庫..."
    docker-compose down -v  # 刪除數據卷
fi

# 啟動容器
docker-compose up -d

# 等待 MySQL 就緒
echo "等待 MySQL 就緒..."
until docker-compose exec -T mysql mysqladmin ping -h"localhost" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" &>/dev/null; do
    echo "MySQL 還在啟動中..."
    sleep 2
done

echo "MySQL 已就緒！"

# 驗證表格是否正確創建
echo "驗證數據庫初始化..."
TABLES_COUNT=$(docker-compose exec -T mysql mysql -h"localhost" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -N -e "SHOW TABLES;" | wc -l)

if [ "$TABLES_COUNT" -eq 0 ]; then
    echo "警告：數據庫表格未正確創建，嘗試手動執行初始化..."
    docker-compose exec -T mysql mysql -h"localhost" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" < mysql/init/01-schema.sql
fi

# 顯示數據庫信息
echo "MySQL 連接信息："
echo "主機：localhost"
echo "端口：${MYSQL_PORT}"
echo "數據庫：${MYSQL_DATABASE}"
echo "用戶名：${MYSQL_USER}"

# 顯示表格信息
echo -e "\n當前數據庫表格："
docker-compose exec -T mysql mysql -h"localhost" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -e "SHOW TABLES;" 