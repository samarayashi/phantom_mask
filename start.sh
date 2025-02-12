#!/bin/bash
set -e  # 添加錯誤檢查
set -o pipefail  # 確保管道命令中的錯誤能被捕獲

# 檢查 Docker 守護進程是否運行
if ! docker info > /dev/null 2>&1; then
    echo "錯誤：Docker 守護進程未運行"
    echo "請先啟動 Docker Desktop 或 Docker 服務"
    exit 1
fi

# 檢查 Node.js 是否安裝
if ! command -v node > /dev/null 2>&1; then
    echo "錯誤：未找到 Node.js"
    echo "請安裝 Node.js 後再試"
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
NEED_ETL=false
if [ "$1" = "--reinit" ]; then
    echo "重新初始化數據庫..."
    docker-compose down -v  # 刪除數據卷
    NEED_ETL=true
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
    echo "警告：數據庫表格未正確創建"
    echo "這種情況通常不應該發生，因為應該由 Docker 自動初始化"
    echo "正在嘗試手動修復..."
    if docker-compose exec -T mysql mysql -h"localhost" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" < mysql/init/01-schema.sql; then
        echo "手動初始化成功完成"
        NEED_ETL=true
    else
        echo "錯誤：手動初始化失敗"
        echo "請檢查數據庫連接設置和初始化腳本"
        exit 1
    fi
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

# 如果需要執行 ETL 或 node_modules 不存在，則安裝依賴
if [ "$NEED_ETL" = true ] || [ ! -d "node_modules" ]; then
    echo "安裝 Node.js 依賴..."
    if ! npm install; then
        echo "錯誤：安裝 Node.js 依賴失敗"
        exit 1
    fi
fi

# 如果需要執行 ETL
if [ "$NEED_ETL" = true ]; then
    echo "開始執行 ETL 流程..."
    
    # 創建日誌目錄
    mkdir -p logs/etl

    # 生成帶時間戳的日誌檔案名稱
    LOG_FILE="logs/etl/etl_$(date +%Y%m%d_%H%M%S).log"
    
    # 執行 ETL 並捕捉退出碼（使用 PIPESTATUS 取得 node 指令的退出碼）
    node src/etl/index.js 2>&1 | tee "$LOG_FILE" || true
    ETL_EXIT_CODE=${PIPESTATUS[0]}
    echo "ETL 退出碼: $ETL_EXIT_CODE"

    # 根據退出碼給出後續提示
    if [ "$ETL_EXIT_CODE" -eq 0 ]; then
        echo "ETL 流程執行成功！"
        echo "詳細日誌已保存到：$LOG_FILE"
    else
        echo "錯誤：ETL 流程執行失敗（退出碼：$ETL_EXIT_CODE）"
        echo "錯誤詳情："
        tail -n 10 "$LOG_FILE"
        echo "完整日誌請查看：$LOG_FILE"
        exit 1
    fi
fi

# 創建應用日誌目錄
mkdir -p logs

echo "系統初始化完成！正在啟動應用程序..."
npm start 