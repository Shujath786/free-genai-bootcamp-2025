from flask import request, jsonify, g
from flask_cors import cross_origin
import math

def load(app):
    @app.route('/study-activities', methods=['GET'])
    @cross_origin()
    def get_study_activities():
        try:
            cursor = app.db.cursor()
            cursor.execute('SELECT id, name, url, preview_url FROM study_activities')
            activities = cursor.fetchall()
            
            return jsonify([{
                'id': activity['id'],
                'title': activity['name'],
                'launch_url': activity['url'],
                'preview_url': activity['preview_url']
            } for activity in activities])
        except Exception as e:
            app.logger.error(f"Error in get_study_activities: {str(e)}")
            return jsonify({'error': str(e)}), 500

    @app.route('/study-activities/<int:id>', methods=['GET'])
    @cross_origin()
    def get_study_activity(id):
        try:
            cursor = app.db.cursor()
            cursor.execute('SELECT id, name, url, preview_url FROM study_activities WHERE id = ?', (id,))
            activity = cursor.fetchone()
            
            if not activity:
                return jsonify({'error': 'Activity not found'}), 404
                
            return jsonify({
                'id': activity['id'],
                'title': activity['name'],
                'launch_url': activity['url'],
                'preview_url': activity['preview_url']
            })
        except Exception as e:
            app.logger.error(f"Error in get_study_activity: {str(e)}")
            return jsonify({'error': str(e)}), 500