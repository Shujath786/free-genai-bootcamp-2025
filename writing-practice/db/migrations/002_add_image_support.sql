-- Add new columns for image support
ALTER TABLE writings ADD COLUMN is_image BOOLEAN DEFAULT FALSE;
ALTER TABLE writings ADD COLUMN ocr_text TEXT;
ALTER TABLE writings ADD COLUMN ocr_confidence REAL;
ALTER TABLE writings ADD COLUMN language TEXT DEFAULT 'eng';
