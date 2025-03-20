import pytest
import os
import tempfile
import json
from app import create_app

@pytest.fixture
def app():
    # Create a temporary file path for the test database
    db_fd, db_path = tempfile.mkstemp()
    
    # Configure the app for testing
    test_config = {
        'TESTING': True,
        'DATABASE': db_path,
        'CORS_ORIGINS': ['*']  # Allow all origins in testing
    }
    
    app = create_app(test_config)
    
    # Initialize the test database
    with app.app_context():
        cursor = app.db.cursor()
        
        # Execute all table creation SQL files
        sql_files = [
            'setup/create_table_words.sql',
            'setup/create_table_word_reviews.sql',
            'setup/create_table_word_review_items.sql',
            'setup/create_table_groups.sql',
            'setup/create_table_word_groups.sql',
            'setup/create_table_study_activities.sql',
            'setup/create_table_study_sessions.sql'
        ]
        
        for sql_file in sql_files:
            try:
                with open(os.path.join(app.root_path, 'sql', sql_file), 'r') as f:
                    sql = f.read()
                    cursor.executescript(sql)
            except Exception as e:
                print(f"Error executing {sql_file}: {str(e)}")
                raise
        
        try:
            # Insert test data
            test_parts = json.dumps({"verb": "test", "noun": "test"})
            test_parts_of_speech = json.dumps({"verb": "verb", "noun": "noun"})  # Example parts of speech
            # Insert word and get its ID
            cursor.execute('''
                INSERT INTO words (english, arabic, root, transliteration, parts, parts_of_speech) 
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('test', 'اختبار', 'خ ب ر', 'ikhtibaar', test_parts, test_parts_of_speech))
            word_id = cursor.lastrowid
            
            # Insert group and get its ID
            cursor.execute('''
                INSERT INTO groups (name) 
                VALUES (?)
            ''', ('Test Group',))
            group_id = cursor.lastrowid
            
            # Insert study activity and get its ID
            cursor.execute('''
                INSERT INTO study_activities (name, url, preview_url) 
                VALUES (?, ?, ?)
            ''', ('Test Activity', 'http://test.com', 'http://test.com/preview'))
            activity_id = cursor.lastrowid
            
            # Insert study session
            cursor.execute('''
                INSERT INTO study_sessions (word_id, group_id, activity_id, correct, timestamp)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (word_id, group_id, activity_id, 1))
            
            # Insert word review
            cursor.execute('''
                INSERT INTO word_reviews (word_id, correct_count, wrong_count)
                VALUES (?, ?, ?)
            ''', (word_id, 1, 0))
            # Link word to group
            cursor.execute('''
                INSERT INTO word_groups (word_id, group_id)
                VALUES (?, ?)
            ''', (word_id, group_id))
            
            app.db.commit()
        except Exception as e:
            print(f"Error inserting test data: {str(e)}")
            raise
    
    yield app
    
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()