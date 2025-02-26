import pytest
from app import create_app

def test_get_words_endpoint(client):
    response = client.get('/api/words')  # Changed from /api/words
    assert response.status_code == 200

def test_get_single_word_endpoint(client):
    response = client.get('/api/words/1')  # Changed from /api/words/1
    assert response.status_code == 200

def test_get_groups_endpoint(client):
    response = client.get('/groups')  # This one was correct
    assert response.status_code == 200

def test_get_single_group_endpoint(client):
    response = client.get('/groups/1')
    assert response.status_code == 200

def test_get_study_activities_endpoint(client):
    response = client.get('/study-activities')  # Changed from /api/study-activities
    assert response.status_code == 200

def test_get_study_sessions_endpoint(client):
    response = client.get('/study-sessions')  # Changed from /api/study-sessions
    assert response.status_code == 200

def test_get_dashboard_endpoint(client):
    response = client.get('/dashboard/recent-session')
    assert response.status_code == 200

def test_nonexistent_word(client):
    response = client.get('/words/999999')  # Changed from /api/words/999999
    assert response.status_code == 404

def test_invalid_word_id(client):
    response = client.get('/words/invalid')  # Changed from /api/words/invalid
    assert response.status_code == 404