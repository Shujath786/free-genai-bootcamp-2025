import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Union
from src.backend.ocr import ImageProcessor
import json

def get_db_connection():
    """Create a database connection with row factory"""
    conn = sqlite3.connect('db/writing.db')
    conn.row_factory = sqlite3.Row
    return conn

def save_writing(topic: str, content: Union[str, bytes], is_image: bool = False, language: str = 'eng', feedback: Optional[str] = None, ocr_text: Optional[str] = None) -> int:
    """Save a new writing entry to the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if is_image:
            # Use provided OCR text if available
            if ocr_text is not None:
                cursor.execute(
                    '''INSERT INTO writings 
                       (topic, content, is_image, ocr_text, language, feedback) 
                       VALUES (?, ?, ?, ?, ?, ?)''',
                    (topic, content, True, ocr_text, language, feedback)
                )
            else:
                # Process image with OCR
                image_processor = ImageProcessor()
                ocr_result = image_processor.extract_text(content, language)
                
                # Store both the original image and OCR results
                cursor.execute(
                    '''INSERT INTO writings 
                       (topic, content, is_image, ocr_text, ocr_confidence, language, feedback) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)''',
                    (topic, content, True, ocr_result['text'], 
                     ocr_result['confidence'], language, feedback)
                )
        else:
            cursor.execute(
                '''INSERT INTO writings 
                   (topic, content, is_image, ocr_text, language, feedback) 
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (topic, content, False, None, language, feedback)
            )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def update_feedback(writing_id: int, feedback: str) -> bool:
    """Update the feedback for a specific writing entry"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'UPDATE writings SET feedback = ? WHERE id = ?',
            (feedback, writing_id)
        )
        conn.commit()
        return True
    finally:
        conn.close()

def get_recent_writings(limit: int = 10) -> List[Dict]:
    """Get the most recent writings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        writings = cursor.execute(
            '''SELECT id, topic, content, feedback, created_at 
               FROM writings 
               ORDER BY created_at DESC 
               LIMIT ?''',
            (limit,)
        ).fetchall()
        return [dict(w) for w in writings]
    finally:
        conn.close()

def get_writing_stats() -> Dict:
    """Get writing statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Total writings
        total = cursor.execute('SELECT COUNT(*) FROM writings').fetchone()[0]
        
        # Writings with feedback
        with_feedback = cursor.execute(
            'SELECT COUNT(*) FROM writings WHERE feedback IS NOT NULL'
        ).fetchone()[0]
        
        # Writings per day (last 7 days)
        daily_stats = cursor.execute(
            '''SELECT DATE(created_at) as date, COUNT(*) as count 
               FROM writings 
               WHERE created_at >= date('now', '-7 days') 
               GROUP BY DATE(created_at)'''
        ).fetchall()
        
        return {
            "total_writings": total,
            "writings_with_feedback": with_feedback,
            "daily_stats": [dict(row) for row in daily_stats]
        }
    finally:
        conn.close()
