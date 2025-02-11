-- 設置時區
SET TIME ZONE 'Asia/Taipei';

-- 藥局表
CREATE TABLE IF NOT EXISTS pharmacies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pharmacy_name UNIQUE (name)
);

-- 藥局營業時段表
CREATE TABLE IF NOT EXISTS pharmacy_hours (
    id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    day_of_week SMALLINT NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE
);

-- 口罩基本資訊表
CREATE TABLE IF NOT EXISTS masks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    pieces_per_pack INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_mask_name UNIQUE (name)
);

-- 藥局販售口罩（庫存）表
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    mask_id BIGINT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pharmacy_mask UNIQUE (pharmacy_id, mask_id),
    CONSTRAINT fk_pharmacy_inventory FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_mask FOREIGN KEY (mask_id) REFERENCES masks(id) ON DELETE CASCADE
);

-- 用戶表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_name UNIQUE (name)
);

-- 交易紀錄表
CREATE TABLE IF NOT EXISTS purchase_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pharmacy_id BIGINT NOT NULL,
    pharmacy_inventory_id BIGINT NOT NULL,
    transaction_amount DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pharmacy_purchase FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory FOREIGN KEY (pharmacy_inventory_id) REFERENCES pharmacy_inventory(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

-- 創建索引
CREATE INDEX idx_pharmacy_hours_pharmacy ON pharmacy_hours (pharmacy_id, day_of_week);
CREATE INDEX idx_inventory_price ON pharmacy_inventory (price);
CREATE INDEX idx_purchase_transaction_date ON purchase_records (transaction_date);
CREATE INDEX idx_purchase_user_amount ON purchase_records (user_id, transaction_amount);

-- 創建全文搜索索引
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_pharmacy_name_trgm ON pharmacies USING gin (name gin_trgm_ops);
CREATE INDEX idx_mask_brand_trgm ON masks USING gin (brand gin_trgm_ops); 