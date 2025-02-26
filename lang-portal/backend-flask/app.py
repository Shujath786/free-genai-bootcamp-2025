import os
from flask import Flask, g
from flask_cors import CORS

from lib.db import Db

# Import route loading functions
from routes.words import load as load_words
from routes.groups import load as load_groups
from routes.study_sessions import load as load_study_sessions
from routes.dashboard import load as load_dashboard
from routes.study_activities import load as load_study_activities

def get_allowed_origins(app):
    try:
        cursor = app.db.cursor()
        cursor.execute('SELECT url FROM study_activities')
        urls = cursor.fetchall()
        # Convert URLs to origins (e.g., https://example.com/app -> https://example.com)
        origins = set()
        for url in urls:
            try:
                from urllib.parse import urlparse
                parsed = urlparse(url['url'])
                origin = f"{parsed.scheme}://{parsed.netloc}"
                origins.add(origin)
            except:
                continue
        return list(origins) if origins else ["*"]
    except:
        return ["*"]  # Fallback to allow all origins if there's an error

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'words.db'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app, resources={r"/*": {"origins": app.config.get('CORS_ORIGINS', get_allowed_origins(app))}})

    app.db = Db()

    @app.teardown_appcontext
    def close_db(exception):
        app.db.close()

    # Load routes
    load_words(app)
    load_groups(app)
    load_study_sessions(app)
    load_dashboard(app)
    load_study_activities(app)

    return app