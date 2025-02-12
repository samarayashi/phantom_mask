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

## F. MySQL 與 PostgreSQL 使用差異筆記

### F.1. 大小寫敏感性

#### 字符串比較
- **MySQL**：
  - 預設不區分大小寫（case-insensitive）
  - 由 collation 決定，不是字符集本身
  - 常用預設：`utf8mb4_0900_ai_ci`（`ci` = case-insensitive）
  - 可通過指定 `utf8mb4_bin` 等 collation 來實現區分大小寫

- **PostgreSQL**：
  - 預設區分大小寫（case-sensitive）
  - 使用 `ILIKE` 運算子可實現不區分大小寫的查詢
  - 可使用 `citext` 擴展提供不區分大小寫的文字類型
  - Sequelize 中 `[Op.like]` 會使用區分大小寫的 `LIKE`

#### 識別符（表名、欄位名）
- **MySQL**：
  - 受 `lower_case_table_names` 設定影響
  - 在 Linux 系統預設區分大小寫
  - 在 Windows 系統預設不區分大小寫

- **PostgreSQL**：
  - 未加引號的識別符會自動轉為小寫
  - 需要保留大小寫時必須使用雙引號
  - 例：`SELECT * FROM "User"` vs `SELECT * FROM user`

### F.2. 全文檢索比較

#### MySQL 全文檢索
- **實現方式**：
  - 需要建立 FULLTEXT INDEX
  - 使用 `MATCH AGAINST` 語法
  
- **搜尋模式**：
  1. Natural Language Mode：
     - 預設模式
     - 自動忽略停用詞
     - 按相關度排序
     - 字數少於最小字數限制的詞會被忽略
  
  2. Boolean Mode：
     - 支援進階運算符（+, -, >, <, ()等）
     - 可搜尋特定字首
     - 不自動排除停用詞
     - 不考慮詞出現頻率

#### PostgreSQL 全文檢索
- **傳統全文檢索實現**：
  - 使用 `tsvector` 和 `tsquery` 類型
  - 可建立 GiST 或 GIN 索引
  - 支援多種語言的文本搜尋配置
  - 適合大量文本內容的搜索

- **模糊匹配實現**：
  - 使用 pg_trgm 擴展
  - 核心操作符：
    - `%`：相似度運算符
    - `similarity()`：計算相似度函數
  - 特點：
    - 基於三字母組（trigram）匹配
    - 適合簡短文本的模糊搜索
    - 可用於拼寫錯誤容錯
    - 支持相似度排序

- **使用場景比較**：
  - 全文檢索（`tsvector/tsquery`）：
    - 適合：文章內容、產品描述等長文本
    - 優勢：支持分詞、詞形還原、權重
  
  - 模糊匹配（`pg_trgm`）：
    - 適合：商品名稱、標題等短文本
    - 優勢：容錯性強、實現簡單

- **特色**：
  - 內建詞形還原
  - 支援複雜的權重分配
  - 可自定義文本搜尋配置
  - 支持多種相似度算法

#### 相關度計算
- **MySQL**：
  - Natural Language Mode：基於詞頻（TF）和逆向文件頻率（IDF）
  - Boolean Mode：不計算相關度，按文檔順序返回

- **PostgreSQL**：
  - 使用更複雜的演算法
  - 考慮詞的位置和權重
  - 支援自定義排名函數

#### 與 LIKE/ILIKE 比較
- **效能差異**：
  - 全文檢索：
    - 使用特殊索引，搜尋大量文本更快
    - 適合複雜的文本搜尋需求
    - 佔用更多存儲空間
  
  - LIKE/ILIKE：
    - 簡單模式匹配
    - 無法使用一般索引（除非是前綴匹配）
    - 對小數據量或簡單匹配較適用
    - 不支援相關度排序

- **使用限制**：
  - 全文檢索：
    - 需要特定的索引支持
    - 有最小詞長度限制
    - 配置較複雜
  
  - LIKE/ILIKE：
    - 語法簡單
    - 靈活性高
    - 無法進行智能分詞
    - 性能較差（特別是使用 '%prefix%' 模式時）

### F.3. 遷移注意事項
1. 字符串比較：從 MySQL 遷移到 PostgreSQL 時，需注意修改：
   - 將 `LIKE` 改為 `ILIKE`（如需不區分大小寫）
   - 或在應用層面進行大小寫轉換

2. 識別符引用：
   - 檢查所有表名和欄位名的引用
   - 添加必要的雙引號
   - 或統一使用小寫命名

3. 全文檢索：
   - 重新設計索引結構
   - 修改搜尋語法
   - 調整相關度計算方式
