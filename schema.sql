-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  name TEXT,
  createdAt TEXT
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  dealId TEXT,
  name TEXT,
  url TEXT,
  type TEXT, -- 'deal' or 'master'
  file_size INTEGER,
  createdAt TEXT
);

-- Master sheets table
CREATE TABLE IF NOT EXISTS master_sheets (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- Validation results table
CREATE TABLE IF NOT EXISTS validations (
  id TEXT PRIMARY KEY,
  dealId TEXT,
  runDate TEXT,
  summary TEXT,
  result JSON
);

-- Validation history table
CREATE TABLE IF NOT EXISTS validation_history (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  validation_date TEXT NOT NULL,
  total_documents INTEGER NOT NULL,
  passed_documents INTEGER NOT NULL,
  failed_documents INTEGER NOT NULL,
  details JSON,
  FOREIGN KEY (deal_id) REFERENCES deals(id)
); 