from flask import request, jsonify, g
from flask_cors import cross_origin
import json

def load(app):
    # Endpoint: GET /api/words with pagination (50 words per page)
    @app.route('/api/words', methods=['GET'])
    @cross_origin()
    def get_words():
        try:
            cursor = app.db.cursor()
            cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="words"')
            if not cursor.fetchone():
                return jsonify({'error': 'Words table not found'}), 500

            # Get the current page number from query parameters (default is 1)
            page = int(request.args.get('page', 1))
            # Ensure page number is positive
            page = max(1, page)
            words_per_page = 50
            offset = (page - 1) * words_per_page

            # Get sorting parameters from the query string
            sort_by = request.args.get('sort_by', 'english')  # Default to sorting by 'english'
            order = request.args.get('order', 'asc')  # Default to ascending order

            # Validate sort_by and order
            valid_columns = ['english', 'arabic', 'root', 'correct_count', 'wrong_count']
            if sort_by not in valid_columns:
                sort_by = 'english'
            if order not in ['asc', 'desc']:
                order = 'asc'

            # Query to fetch words with sorting
            cursor.execute(f'''
                SELECT w.id, w.english, w.arabic, w.root, w.transliteration, w.parts,
                    COALESCE(r.correct_count, 0) AS correct_count,
                    COALESCE(r.wrong_count, 0) AS wrong_count
                FROM words w
                LEFT JOIN word_reviews r ON w.id = r.word_id
                ORDER BY {sort_by} {order}
                LIMIT ? OFFSET ?
            ''', (words_per_page, offset))

            words = cursor.fetchall()

            # Query the total number of words
            cursor.execute('SELECT COUNT(*) FROM words')
            total_words = cursor.fetchone()[0]
            total_pages = (total_words + words_per_page - 1) // words_per_page

            # Format the response
            words_data = []
            for word in words:
                word_dict = {
                    'id': word['id'],
                    'english': word['english'],
                    'arabic': word['arabic'],
                    'root': word['root'],
                    'transliteration': word['transliteration'],
                    'parts': json.loads(word['parts']) if word['parts'] else {},
                    'correct_count': word['correct_count'],
                    'wrong_count': word['wrong_count']
                }
                words_data.append(word_dict)

            return jsonify({
                'words': words_data,
                'total_pages': total_pages,
                'current_page': page,
                'total_words': total_words
            })

        except Exception as e:
            app.logger.error(f"Error in get_words: {str(e)}")
            return jsonify({'error': str(e)}), 500

    # Endpoint: POST /api/words to create a new word
    @app.route('/api/words', methods=['POST'])
    @cross_origin()
    def create_word():
        try:
            data = request.get_json()
            if not data or 'word' not in data or 'meaning' not in data:
                return jsonify({'error': 'Missing required fields: word and meaning'}), 400

            cursor = app.db.cursor()
            
            # Check if the word already exists
            cursor.execute('SELECT id FROM words WHERE english = ?', (data['word'],))
            if cursor.fetchone():
                return jsonify({'error': 'Word already exists'}), 409

            # Insert the new word
            cursor.execute('''
                INSERT INTO words (english, arabic)
                VALUES (?, ?)
            ''', (data['word'], data['meaning']))
            
            app.db.commit()
            word_id = cursor.lastrowid

            # Return the created word
            cursor.execute('''
                SELECT id, english as word, arabic as meaning
                FROM words WHERE id = ?
            ''', (word_id,))
            
            new_word = cursor.fetchone()
            return jsonify(new_word), 201

        except Exception as e:
            app.db.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/words/<int:word_id>', methods=['GET'])
    @cross_origin()
    def get_word(word_id):
        try:
            cursor = app.db.cursor()
            cursor.execute('''
                SELECT w.*, COALESCE(r.correct_count, 0) as correct_count, 
                       COALESCE(r.wrong_count, 0) as wrong_count
                FROM words w
                LEFT JOIN word_reviews r ON w.id = r.word_id
                WHERE w.id = ?
            ''', (word_id,))
            
            word = cursor.fetchone()
            if word is None:
                return jsonify({'error': 'Word not found'}), 404
                
            word_data = {
                'id': word['id'],
                'english': word['english'],
                'arabic': word['arabic'],
                'root': word['root'],
                'transliteration': word['transliteration'],
                'parts': json.loads(word['parts']) if word['parts'] else {},
                'correct_count': word['correct_count'],
                'wrong_count': word['wrong_count']
            }
            
            return jsonify(word_data)
            
        except Exception as e:
            app.logger.error(f"Error in get_word: {str(e)}")
            return jsonify({'error': str(e)}), 500