-- FinPulse SQL Schema (No extensions required)
-- File: finPulse_noext.sql
-- Purpose: Same schema as finPulse_schema.sql but avoids CREATE EXTENSION and UUIDs
-- so it can be run without superuser privileges. Uses BIGSERIAL/BIGINT keys.

-- ======= 1) Core Tables (no extensions required) =======

-- Users table (authenticated users)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Assets table (coins, stocks, tokens)
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    is_stock BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    market_cap BIGINT,
    total_volume BIGINT,
    current_price NUMERIC(18,6),
    price_change_24h NUMERIC(8,4),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Historical price series (time-series)
CREATE TABLE IF NOT EXISTS historical_prices (
    id BIGSERIAL PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    ts TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC(18,6) NOT NULL,
    volume BIGINT,
    UNIQUE (asset_id, ts)
);

-- Portfolio table: one row per user portfolio (meta)
CREATE TABLE IF NOT EXISTS portfolios (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Portfolio items: holdings or tracked assets in a portfolio
CREATE TABLE IF NOT EXISTS portfolio_items (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    quantity NUMERIC(20,8) DEFAULT 0,
    average_price NUMERIC(18,6),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(portfolio_id, asset_id)
);

-- Price alerts (user-defined)
CREATE TABLE IF NOT EXISTS price_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    target_price NUMERIC(18,6) NOT NULL,
    direction TEXT CHECK(direction IN ('above','below')) DEFAULT 'above',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

-- News items (optional caching of aggregated headlines)
CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT,
    source TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    key_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ======= Indexes & Performance =======
CREATE INDEX IF NOT EXISTS idx_assets_symbol_lower ON assets (lower(symbol));
CREATE INDEX IF NOT EXISTS idx_hist_prices_asset_ts ON historical_prices (asset_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolios (user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts (user_id, active);
CREATE INDEX IF NOT EXISTS idx_news_title_gin ON news USING gin (to_tsvector('english', title));

-- ======= Example Seed Data =======
INSERT INTO assets (id, symbol, name, is_stock, image_url, market_cap, total_volume, current_price, price_change_24h)
VALUES
('bitcoin','btc','Bitcoin', FALSE, 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 1300000000000, 30000000000, 65000.000000, 2.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO assets (id, symbol, name, is_stock, image_url, market_cap, total_volume, current_price, price_change_24h)
VALUES
('ethereum','eth','Ethereum', FALSE, 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 420000000000, 15000000000, 3500.000000, -1.2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO assets (id, symbol, name, is_stock, image_url, market_cap, total_volume, current_price, price_change_24h)
VALUES
('AAPL','aapl','Apple Inc.', TRUE, NULL, 3200000000000, 25000000, 210.500000, 0.8)
ON CONFLICT (id) DO NOTHING;

-- Example user (will get an auto-incremented id)
INSERT INTO users (email, display_name)
VALUES
('demo@example.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Create a portfolio for the user and add bitcoin to it
DO $$
DECLARE
    u_id BIGINT;
    p_id BIGINT;
BEGIN
    SELECT id INTO u_id FROM users WHERE email = 'demo@example.com' LIMIT 1;
    IF u_id IS NULL THEN
        RAISE NOTICE 'Demo user not found';
        RETURN;
    END IF;
    INSERT INTO portfolios (user_id, name) VALUES (u_id, 'Main') ON CONFLICT DO NOTHING;
    SELECT id INTO p_id FROM portfolios WHERE user_id = u_id AND name = 'Main' LIMIT 1;
    IF p_id IS NOT NULL THEN
        INSERT INTO portfolio_items (portfolio_id, asset_id, quantity, average_price)
        VALUES (p_id, 'bitcoin', 0.1, 60000.0)
        ON CONFLICT DO NOTHING;
    END IF;
END$$;

-- Seed some historical prices for bitcoin (last 7 days as example)
INSERT INTO historical_prices (asset_id, ts, price, volume)
VALUES
('bitcoin', now() - INTERVAL '6 days', 60000.00, 25000000000),
('bitcoin', now() - INTERVAL '5 days', 60250.00, 23000000000),
('bitcoin', now() - INTERVAL '4 days', 61000.00, 24000000000),
('bitcoin', now() - INTERVAL '3 days', 63000.00, 26000000000),
('bitcoin', now() - INTERVAL '2 days', 64000.00, 27000000000),
('bitcoin', now() - INTERVAL '1 day', 64500.00, 28000000000),
('bitcoin', now(), 65000.00, 30000000000)
ON CONFLICT DO NOTHING;

-- ======= Helpful Views and Queries =======
CREATE OR REPLACE VIEW user_portfolio_view AS
SELECT p.id AS portfolio_id,
       p.user_id,
       pi.asset_id,
       a.symbol,
       a.name,
       a.current_price,
       a.price_change_24h,
       pi.quantity,
       pi.average_price,
       (pi.quantity * a.current_price) AS market_value
FROM portfolios p
JOIN portfolio_items pi ON pi.portfolio_id = p.id
JOIN assets a ON a.id = pi.asset_id;

-- ======= Triggers (optional): auto-update updated_at =======
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Notes: This file avoids requiring the pgcrypto extension and uses BIGSERIAL keys
-- so it can be applied by a regular database user that has CREATE TABLE privileges.
