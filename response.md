# Phantom Mask 專案回應文件

## A. 專案概述與完成度

### A.1. 需求完成情況
- [x] 列出特定時間和星期幾營業的藥局
  - 實現於 `GET /api/pharmacies/open` API
  - 支援時間格式：HH:mm
  - 支援星期：1-7（週一至週日）
- [x] 列出指定藥局的口罩商品（可依名稱或價格排序）
  - 實現於 `GET /api/pharmacies/{id}/masks` API
  - 支援 sortBy: name/price
  - 支援 order: asc/desc
- [x] 列出特定價格範圍內且商品數量符合條件的藥局
  - 實現於 `GET /api/pharmacies/filter` API
  - 支援最小/最大價格範圍
  - 支援商品數量的大於/小於比較
- [x] 列出指定日期範圍內消費金額最高的用戶
  - 實現於 `GET /api/transactions/top-users` API
  - 支援按購買數量或金額排序
- [x] 統計指定日期範圍內的口罩銷售總量與金額
  - 實現於 `GET /api/transactions/statistics` API
- [x] 依相關度搜尋藥局或口罩
  - 實現於 `GET /api/search/v1`（MySQL 全文檢索版本）
  - 實現於 `GET /api/search/v2`（LIKE 模式匹配版本）
- [x] 處理用戶購買口罩的交易流程
  - 實現於 `POST /api/transactions/purchase` API
  - 包含原子性交易處理
  - 自動處理庫存、用戶餘額、藥局餘額更新

### A.2. API 文件
- 本地開發環境：http://localhost:3000/api-docs
- 線上部署環境：https://phantom-mask-hw2y.onrender.com/api-docs
  (free instance冷啟動需要一點時間)

## B. 技術實現

### B.1. 主要技術棧
- 後端框架：Express.js
- 資料庫：MySQL (本地開發) / PostgreSQL (線上部署)
- ORM：Sequelize
- API 文件：Swagger/OpenAPI 3.1.0
- 容器化：Docker & Docker Compose
- 部署平台：Render.com

### B.2. 資料庫設計
主要資料表：
- Pharmacies：藥局基本資料
- PharmacyHours：藥局營業時間
- Masks：口罩基本資料
- PharmacyInventory：藥局口罩庫存
- Users：用戶資料
- PurchaseRecords：交易紀錄

特色：
- 使用 FULLTEXT INDEX 優化搜尋效能
- 完整的外鍵關聯確保資料完整性
- 針對常用查詢建立適當索引

## C. 本地開發指南

### C.1. 環境準備
1. 確保已安裝：
   - Node.js
   - Docker & Docker Compose
   - Git

2. 克隆專案：
   ```bash
   git clone [專案地址]
   cd phantom-mask
   ```

3. 環境設定：
   ```bash
   cp .env.example .env
   # 編輯 .env 檔案設定必要參數
   ```

### C.2. 專案啟動方式

#### 方式一：使用啟動腳本（推薦）
1. 賦予腳本執行權限：
   ```bash
   chmod +x start.sh
   ```

2. 啟動選項：
   - 一般啟動（保留現有數據）：
     ```bash
     ./start.sh
     ```
   - 重新初始化數據後啟動：
     ```bash
     ./start.sh --reinit
     ```

   腳本會自動執行以下步驟：
   - 檢查環境依賴
   - 啟動 Docker 容器
   - 初始化/重置數據庫（如使用 --reinit）
   - 執行 ETL 流程（如需要）
   - 啟動應用服務

#### 方式二：手動執行（開發用）
如果您想要更靈活地控制每個步驟，可以按照以下順序手動執行：

1. Docker 環境準備：
   - 停止並清理現有容器：
     ```bash
     docker-compose down
     ```
   - 如需重新初始化數據（清空所有數據）：
     ```bash
     docker-compose down -v  # 這會刪除所有數據卷
     ```
   - 啟動 Docker 容器：
     ```bash
     docker-compose up -d
     ```
   - 等待 MySQL 就緒（可以觀察 docker-compose logs）

2. Node.js 環境準備：
   ```bash
   npm install
   ```

3. 數據初始化（如果需要）：
   ```bash
   npm run etl
   ```

4. 啟動應用（選擇其一）：
   - 生產模式：
     ```bash
     npm run start
     ```
   - 開發模式（支援熱重載）：
     ```bash
     npm run dev
     ```

注意事項：
- 手動執行時需要確保每個步驟都成功完成
- 如果重新初始化了數據庫（使用 `down -v`），必須執行 ETL
- 建議使用 `docker-compose logs` 檢查容器狀態
- 如遇問題可查看 `logs` 目錄下的日誌文件

### C.3. 訪問服務
- API 服務：http://localhost:3000
- API 文件：http://localhost:3000/api-docs

## D. 線上部署

### D.1. 部署資訊
- 部署平台：Render.com
- 資料庫：PostgreSQL
- API 文件：https://phantom-mask-hw2y.onrender.com/api-docs

### D.2. 部署分支說明
- 主分支：使用 MySQL 的本地開發版本
- render 分支：針對 Render.com 平台優化的 PostgreSQL 版本
  - 修改資料庫連接配置
  - 調整 SQL 語法（如 LIKE/ILIKE）
  - 優化全文檢索實現

## E. 待辦事項
1. 補充單元測試與整合測試
2. 添加更多資料驗證
