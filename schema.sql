-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TEXT
);

-- Documents table with validation support
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('masterSheet', 'supporting')),
  size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  validated BOOLEAN DEFAULT false,
  validation_log TEXT,
  url TEXT NOT NULL,
  extracted_text TEXT, -- For Phase 4 content parsing
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- Migration from old schema (if needed)
-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS master_sheets;
DROP TABLE IF EXISTS validations;
DROP TABLE IF EXISTS validation_history; 