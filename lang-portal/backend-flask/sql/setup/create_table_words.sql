CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  arabic TEXT NOT NULL,
  root TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  parts TEXT NOT NULL  -- Store parts as JSON string
);