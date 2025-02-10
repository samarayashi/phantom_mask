-- 設置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 藥局表
CREATE TABLE IF NOT EXISTS Pharmacies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '藥局ID',
    name VARCHAR(255) NOT NULL COMMENT '藥局名稱',
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '現金餘額',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    UNIQUE KEY uq_pharmacy_name (name)
) ENGINE=InnoDB COMMENT='藥局基本資料表';

-- 藥局營業時段表
CREATE TABLE IF NOT EXISTS PharmacyHours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '營業時段ID',
    pharmacy_id BIGINT UNSIGNED NOT NULL COMMENT '藥局ID',
    day_of_week TINYINT UNSIGNED NOT NULL COMMENT '星期幾(1=週一, ... 7=週日)',
    open_time TIME NOT NULL COMMENT '開始營業時間',
    close_time TIME NOT NULL COMMENT '結束營業時間',
    is_open BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否營業(FALSE=休息)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    INDEX idx_pharmacy_day (pharmacy_id, day_of_week),
    FOREIGN KEY (pharmacy_id) REFERENCES Pharmacies(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='藥局營業時間表';

-- 口罩基本資訊表
CREATE TABLE IF NOT EXISTS Masks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '口罩ID',
    name VARCHAR(255) NOT NULL COMMENT '口罩名稱',
    brand VARCHAR(100) NOT NULL COMMENT '品牌名稱',
    color VARCHAR(50) NOT NULL COMMENT '口罩顏色',
    pieces_per_pack INT UNSIGNED NOT NULL COMMENT '每包數量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    UNIQUE KEY uq_mask_name (name)
) ENGINE=InnoDB COMMENT='口罩基本資料表';

-- 藥局販售口罩（庫存）表
CREATE TABLE IF NOT EXISTS PharmacyInventory (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '庫存ID',
    pharmacy_id BIGINT UNSIGNED NOT NULL COMMENT '藥局ID',
    mask_id BIGINT UNSIGNED NOT NULL COMMENT '口罩ID',
    price DECIMAL(10,2) NOT NULL COMMENT '售價',
    stock INT NOT NULL DEFAULT 0 COMMENT '庫存數量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    UNIQUE KEY uq_pharmacy_mask (pharmacy_id, mask_id),
    INDEX idx_price (price),
    FOREIGN KEY (pharmacy_id) REFERENCES Pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (mask_id) REFERENCES Masks(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='藥局口罩庫存表';

-- 用戶表
CREATE TABLE IF NOT EXISTS Users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用戶ID',
    name VARCHAR(255) NOT NULL COMMENT '用戶名稱',
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '現金餘額',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    UNIQUE KEY uq_user_name (name)
) ENGINE=InnoDB COMMENT='用戶基本資料表';

-- 交易紀錄表
CREATE TABLE IF NOT EXISTS PurchaseRecords (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '交易ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用戶ID',
    pharmacy_id BIGINT UNSIGNED NOT NULL COMMENT '藥局ID',
    pharmacy_inventory_id BIGINT UNSIGNED NOT NULL COMMENT '庫存ID',
    transaction_amount DECIMAL(10,2) NOT NULL COMMENT '交易金額',
    quantity INT NOT NULL DEFAULT 1 COMMENT '購買數量',
    transaction_date DATETIME NOT NULL COMMENT '交易日期',
    status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT '交易狀態',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_user_amount (user_id, transaction_amount),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES Pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_inventory_id) REFERENCES PharmacyInventory(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='購買交易紀錄表';

-- 在 Pharmacies 表添加全文索引
ALTER TABLE Pharmacies ADD FULLTEXT INDEX idx_pharmacy_name (name);

-- 在 Masks 表添加全文索引
ALTER TABLE Masks ADD FULLTEXT INDEX idx_mask_brand (brand);

SET FOREIGN_KEY_CHECKS = 1; 