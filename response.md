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

### B.3. ETL 實現
專案包含完整的 ETL（Extract, Transform, Load）流程，用於處理原始資料並載入資料庫：

#### B.3.1. ETL 架構
- 模組化設計：每個資料表都有獨立的轉換器
  - `PharmaciesTrans.js`：藥局基本資料轉換
  - `MasksTrans.js`：口罩資料轉換
  - `PharmacyHoursTrans.js`：營業時間轉換
  - `PharmacyInventoryTrans.js`：庫存資料轉換
  - `UsersTrans.js`：用戶資料轉換
  - `PurchaseRecordsTrans.js`：交易記錄轉換

#### B.3.2. ETL 流程
1. 第一階段：基礎資料轉換
   - 處理藥局基本資料
   - 處理口罩基本資料

2. 第二階段：關聯資料轉換
   - 處理藥局營業時間（解析不同格式的時間字串）
   - 處理藥局庫存資料

3. 第三階段：使用者相關資料
   - 處理使用者資料
   - 處理歷史交易記錄

#### B.3.3. 執行方式
1. 透過啟動腳本自動執行：
   ```bash
   ./start.sh
   ```

2. 單獨執行 ETL：
   ```bash
   npm run etl
   ```

特色：
- 支援資料去重和更新機制
- 完整的錯誤處理和日誌記錄
- 模組化設計，易於維護和擴展

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

### C.2. 啟動專案
1. 執行初始化腳本：
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   此腳本會：
   - 啟動 MySQL 容器
   - 初始化資料庫結構
   - 執行資料轉換與匯入

2. 啟動應用服務：
   ```bash
   npm install
   npm run start
   ```

3. 訪問 API 文件：
   - 打開瀏覽器訪問 http://localhost:3000/api-docs

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
