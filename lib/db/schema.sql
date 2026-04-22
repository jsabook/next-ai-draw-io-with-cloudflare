-- 管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

-- 创建用户名索引
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 提示词覆盖表（热修改 AI 提示词）
CREATE TABLE IF NOT EXISTS prompt_overrides (
    key TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 风格预设表（图表生成风格偏向）
CREATE TABLE IF NOT EXISTS style_presets (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    prompt_snippet TEXT NOT NULL,
    is_builtin INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
