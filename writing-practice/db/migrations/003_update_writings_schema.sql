-- Create temporary table with new schema
CREATE TABLE writings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    content BLOB,
    content_type TEXT DEFAULT 'text',
    is_image BOOLEAN DEFAULT FALSE,
    ocr_text TEXT,
    ocr_confidence REAL,
    language TEXT DEFAULT 'eng',
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO writings_new (id, topic, content, feedback, created_at)
SELECT id, topic, content, feedback, created_at FROM writings;

-- Drop old table and rename new table
DROP TABLE writings;
ALTER TABLE writings_new RENAME TO writings;
