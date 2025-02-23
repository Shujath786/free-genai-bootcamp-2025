from flask import request, jsonify, g
from flask_cors import cross_origin
from datetime import datetime
import math

def load(app):
    @app.route('/study-sessions', methods=['GET'])
    @cross_origin()
    def get_study_sessions():
        try:
            cursor = app.db.cursor()
            
            # Get pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            offset = (page - 1) * per_page

            # Get total count
            cursor.execute('''
                SELECT COUNT(*) as count 
                FROM study_sessions ss
                JOIN groups g ON g.id = ss.group_id
                JOIN study_activities sa ON sa.id = ss.activity_id
                JOIN words w ON w.id = ss.word_id
            ''')
            total_count = cursor.fetchone()['count']

            # Get paginated sessions
            cursor.execute('''
                SELECT 
                    ss.id,
                    ss.word_id,
                    w.english as word_english,
                    ss.group_id,
                    ss.activity_id,
                    ss.correct,
                    ss.timestamp,
                    g.name as group_name,
                    sa.name as activity_name
                FROM study_sessions ss
                JOIN groups g ON g.id = ss.group_id
                JOIN study_activities sa ON sa.id = ss.activity_id
                JOIN words w ON w.id = ss.word_id
                ORDER BY ss.timestamp DESC
                LIMIT ? OFFSET ?
            ''', (per_page, offset))
            
            sessions = cursor.fetchall()
            
            return jsonify({
                'sessions': [{
                    'id': session['id'],
                    'word_id': session['word_id'],
                    'word_english': session['word_english'],
                    'group_id': session['group_id'],
                    'activity_id': session['activity_id'],
                    'correct': bool(session['correct']),
                    'timestamp': session['timestamp'],
                    'group_name': session['group_name'],
                    'activity_name': session['activity_name']
                } for session in sessions],
                'total': total_count,
                'page': page,
                'per_page': per_page,
                'total_pages': math.ceil(total_count / per_page)
            })
        except Exception as e:
            app.logger.error(f"Error in get_study_sessions: {str(e)}")
            return jsonify({'error': str(e)}), 500