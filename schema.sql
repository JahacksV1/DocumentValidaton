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
  createdAt TEXT
);

-- Validation results table
CREATE TABLE IF NOT EXISTS validations (
  id TEXT PRIMARY KEY,
  dealId TEXT,
  runDate TEXT,
  summary TEXT,
  result JSON
); 