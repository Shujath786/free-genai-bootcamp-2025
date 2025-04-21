import sqlite3
import random
from typing import Dict, List, Optional, Tuple

def get_db_connection():
    """Create a database connection with row factory"""
    conn = sqlite3.connect('db/writing.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_words_table():
    """Initialize the words table and populate with initial data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create words table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            arabic TEXT NOT NULL,
            english TEXT NOT NULL,
            difficulty TEXT DEFAULT 'beginner'
        )
    ''')
    
    # Check if table is empty
    cursor.execute('SELECT COUNT(*) FROM words')
    if cursor.fetchone()[0] == 0:
        # Initial word list
        words = [
            ('مرحبا', 'hello', 'beginner'),
            ('شكرا', 'thank you', 'beginner'),
            ('كيف حالك', 'how are you', 'beginner'),
            ('صباح الخير', 'good morning', 'beginner'),
            ('مساء الخير', 'good evening', 'beginner'),
            ('نعم', 'yes', 'beginner'),
            ('لا', 'no', 'beginner'),
            ('من فضلك', 'please', 'beginner'),
            ('عفوا', 'excuse me', 'beginner'),
            ('مع السلامة', 'goodbye', 'beginner')
        ]
        cursor.executemany('INSERT INTO words (arabic, english, difficulty) VALUES (?, ?, ?)', words)
        conn.commit()
    
    conn.close()

def get_random_word(difficulty: str = 'beginner') -> Optional[Dict]:
    """Get a random word from the database based on difficulty level"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT * FROM words WHERE difficulty = ? ORDER BY RANDOM() LIMIT 1',
        (difficulty,)
    )
    word = cursor.fetchone()
    conn.close()
    
    if word:
        return {
            'id': word['id'],
            'arabic': word['arabic'],
            'english': word['english'],
            'difficulty': word['difficulty']
        }
    return None

def add_word(arabic: str, english: str, difficulty: str = 'beginner') -> int:
    """Add a new word to the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO words (arabic, english, difficulty) VALUES (?, ?, ?)',
        (arabic, english, difficulty)
    )
    conn.commit()
    word_id = cursor.lastrowid
    conn.close()
    
    return word_id

def get_all_words(difficulty: Optional[str] = None) -> List[Dict]:
    """Get all words from the database, optionally filtered by difficulty"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if difficulty:
        cursor.execute('SELECT * FROM words WHERE difficulty = ?', (difficulty,))
    else:
        cursor.execute('SELECT * FROM words')
    
    words = cursor.fetchall()
    conn.close()
    
    return [{
        'id': word['id'],
        'arabic': word['arabic'],
        'english': word['english'],
        'difficulty': word['difficulty']
    } for word in words]
