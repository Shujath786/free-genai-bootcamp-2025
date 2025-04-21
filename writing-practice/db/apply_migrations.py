import sqlite3
import os
from pathlib import Path

def apply_migrations():
    """Apply all SQL migrations in order"""
    db_path = Path(__file__).parent / 'writing.db'
    migrations_path = Path(__file__).parent / 'migrations'
    
    # Create connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create migrations table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                filename TEXT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Get list of applied migrations
        applied_migrations = {row[0] for row in cursor.execute('SELECT filename FROM migrations')}
        
        # Get all migration files
        migration_files = sorted([f for f in os.listdir(migrations_path) if f.endswith('.sql')])
        
        # Apply new migrations
        for migration_file in migration_files:
            if migration_file not in applied_migrations:
                print(f"Applying migration: {migration_file}")
                
                # Read and execute migration
                with open(migrations_path / migration_file) as f:
                    cursor.executescript(f.read())
                
                # Record migration
                cursor.execute('INSERT INTO migrations (filename) VALUES (?)', (migration_file,))
                conn.commit()
                
        print("All migrations applied successfully")
        
    except Exception as e:
        print(f"Error applying migrations: {str(e)}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    apply_migrations()
