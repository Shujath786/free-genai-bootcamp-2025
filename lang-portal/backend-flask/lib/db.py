import sqlite3
import json
from flask import g

class Db:
  def __init__(self, database='words.db'):
    self.database = database
    self.connection = None

  def get(self):
    if 'db' not in g:
      g.db = sqlite3.connect(self.database)
      g.db.row_factory = sqlite3.Row  # Return rows as dictionaries
    return g.db

  def commit(self):
    self.get().commit()

  def cursor(self):
    # Ensure the connection is valid before getting a cursor
    connection = self.get()
    return connection.cursor()

  def close(self):
    db = g.pop('db', None)
    if db is not None:
      db.close()

  # Function to load SQL from a file
  def sql(self, filepath):
    with open('sql/' + filepath, 'r') as file:
      return file.read()

  # Function to load the words from a JSON file
  def load_json(self, filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
      return json.load(file)

  def setup_tables(self, cursor):
    """Set up all database tables from SQL files."""
    table_files = [
        'create_table_words.sql',
        'create_table_word_reviews.sql',
        'create_table_word_review_items.sql',
        'create_table_groups.sql',
        'create_table_word_groups.sql',
        'create_table_study_activities.sql',
        'create_table_study_sessions.sql'
    ]
    
    for sql_file in table_files:
        try:
            # Execute the SQL from each file
            cursor.execute(self.sql(f'setup/{sql_file}'))
            self.get().commit()
            print(f"Successfully created table from {sql_file}")
        except Exception as e:
            print(f"Error creating table from {sql_file}: {str(e)}")
            # Depending on your error handling strategy, you might want to:
            # - raise the exception
            # - log it to a file
            # - continue with the next file
            raise  # This will stop execution if any table fails to create

  def import_study_activities_json(self,cursor,data_json_path):
    study_actvities = self.load_json(data_json_path)
    for activity in study_actvities:
      cursor.execute('''
      INSERT INTO study_activities (name,url,preview_url) VALUES (?,?,?)
      ''', (activity['name'],activity['url'],activity['preview_url'],))
    self.get().commit()

  def import_word_json(self,cursor,group_name,data_json_path,words_key='verbs'):
    # Insert a new group
    cursor.execute('''
      INSERT INTO groups (name) VALUES (?)
    ''', (group_name,))
    self.get().commit()

    # Get the ID of the group
    cursor.execute('SELECT id FROM groups WHERE name = ?', (group_name,))
    group_id = cursor.fetchone()[0]

    # Load and parse JSON file - now handling the nested structure
    json_data = self.load_json(data_json_path)
    # Extract the words array from the JSON object using the provided key
    words = json_data.get(words_key, [])

    for word in words:
        # Get the parts array - could be named either 'parts' or 'letters'
        parts = word.get('parts', []) if 'parts' in word else word.get('letters', [])
        
        # Insert the word into the words table
        cursor.execute('''
            INSERT INTO words (english, arabic, root, transliteration, parts, parts_of_speech) 
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            word['english'], 
            word['arabic'], 
            word['root'],
            word['transliteration'],
            json.dumps(parts),  # Convert the parts array to JSON string
            ""
        ))
        
        # Get the last inserted word's ID
        word_id = cursor.lastrowid

        # Insert the word-group relationship into word_groups table
        cursor.execute('''
            INSERT INTO word_groups (word_id, group_id) VALUES (?, ?)
        ''', (word_id, group_id))
    self.get().commit()

    # Update the words_count in the groups table
    cursor.execute('''
      UPDATE groups
      SET words_count = (
        SELECT COUNT(*) FROM word_groups WHERE group_id = ?
      )
      WHERE id = ?
    ''', (group_id, group_id))

    self.get().commit()

    print(f"Successfully added {len(words)} words to the '{group_name}' group.")
    
  # Initialize the database with sample data
  def init(self, app):
    with app.app_context():
      # Drop existing tables (if they exist) before creating new ones
      cursor = self.cursor()
      cursor.execute("DROP TABLE IF EXISTS words")
      cursor.execute("DROP TABLE IF EXISTS word_reviews")
      cursor.execute("DROP TABLE IF EXISTS word_review_items")
      cursor.execute("DROP TABLE IF EXISTS groups")
      cursor.execute("DROP TABLE IF EXISTS word_groups")
      cursor.execute("DROP TABLE IF EXISTS study_activities")
      cursor.execute("DROP TABLE IF EXISTS study_sessions")
      self.get().commit()

      cursor = self.cursor()
      self.setup_tables(cursor)
      self.import_word_json(
        cursor=cursor,
        group_name='Core Verbs',
        data_json_path='seed/data_verbs.json',
        words_key='verbs'
      )
      self.import_word_json(
        cursor=cursor,
        group_name='Core Adjectives',
        data_json_path='seed/data_adjectives.json',
        words_key='adjectives'
      )

      self.import_study_activities_json(
        cursor=cursor,
        data_json_path='seed/study_activities.json'
      )

# Create an instance of the Db class
db = Db()
