# API Testing Documentation

This README provides instructions for setting up and running tests for the API endpoints using pytest with the pytest-flask extension.

## Prerequisites

Ensure you have Python installed on your system.

## Setup

### Step 1: Install Required Packages

Add the following entries to your `requirements.txt` file:

```
pytest>=7.0.0
pytest-flask>=1.2.0
```

Then install the dependencies:

```bash
pip install -r requirements.txt
```

### Step 2: Create Test Files

#### Create `test_api_endpoints.py`

Create a new file named `test_api_endpoints.py` with the following content:

```python
import pytest
from app import create_app

@pytest.fixture
def app():
    app = create_app()
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_words_endpoint(client):
    response = client.get('/words')
    assert response.status_code == 200

def test_get_single_word_endpoint(client):
    # Assuming there's a word with ID 1 in the database
    response = client.get('/words/1')
    assert response.status_code == 200

def test_get_groups_endpoint(client):
    response = client.get('/groups')
    assert response.status_code == 200

def test_get_single_group_endpoint(client):
    # Assuming there's a group with ID 1
    response = client.get('/groups/1')
    assert response.status_code == 200

def test_get_study_activities_endpoint(client):
    response = client.get('/study_activities')
    assert response.status_code == 200

def test_get_study_sessions_endpoint(client):
    response = client.get('/study_sessions')
    assert response.status_code == 200

def test_get_dashboard_endpoint(client):
    response = client.get('/dashboard')
    assert response.status_code == 200
```

#### Create `conftest.py`

Create a `conftest.py` file in the same directory to configure pytest:

```python
import pytest
import os
import tempfile
from app import create_app
from lib.db import init_db

@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp()
    app = create_app({
        'TESTING': True,
        'DATABASE': db_path,
    })

    # Initialize the test database
    with app.app_context():
        init_db()
        # Add any test data here if needed

    yield app

    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
```

## Running Tests

To run all tests:

```bash
pytest -v
```

To run only the API endpoint tests (to avoid colorama errors):

```bash
python -m pytest tests/test_api_endpoints.py -v
```

## Test Descriptions

The tests verify that the following API endpoints return a 200 status code:

- `/words` - Get all words
- `/words/1` - Get a single word by ID
- `/groups` - Get all groups
- `/groups/1` - Get a single group by ID
- `/study_activities` - Get all study activities
- `/study_sessions` - Get all study sessions
- `/dashboard` - Get dashboard data

## Notes

- The tests assume there is data in the database (e.g., a word with ID 1, a group with ID 1).
- A temporary test database is created for testing and cleaned up afterward.
- The test database is initialized using `init_db()` from the `lib.db` module.
