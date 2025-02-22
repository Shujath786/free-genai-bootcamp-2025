# Backend Server Technical Specs

## Business Goal: 

 A language learning school wants to build a prototype of learning  
  portal  which will act as three things:
- Inventory of possible vocabulary that can be learned.
- Act as a  Learning record store (LRS), providing correct and wrong   
  score  on practice vocabulary.
- A unified launchpad to launch different learning apps.


## Technical requirements:

- The backend will be built using Python3.
- The database will be sqlite3.
- The API will be built using Flask.
- The API will always return JSON.
- There will be no authentication or authorization.
- There will be a single user.

## Directory Structure:

backend-flask/
│
├── app.py                 # Main application entry point
├── migrate.py            # Database migration script
├── tasks.py             # Task definitions
├── requirements.txt     # Python dependencies
│
├── lib/                 # Core library modules
│   └── db.py           # Database connection and operations
│
├── routes/             # API route handlers
│   ├── dashboard.py    # Dashboard endpoints
│   ├── groups.py       # Word groups endpoints
│   ├── study_activities.py  # Study activities endpoints
│   ├── study_sessions.py   # Study sessions endpoints
│   └── words.py           # Words endpoints
│
├── seed/               # Seed data for database
│   ├── data_adjectives.json  # Initial adjectives data
│   ├── data_verbs.json      # Initial verbs data
│   └── study_activities.json # Initial study activities
│
├── sql/               # SQL queries and schema
│   └── setup/         # Database setup scripts
│       ├── create_table_groups.sql
│       ├── create_table_study_activities.sql
│       ├── create_table_study_sessions.sql
│       ├── create_table_word_groups.sql
│       ├── create_table_word_review_items.sql
│       ├── create_table_word_reviews.sql
│       ├── create_table_words.sql
│       ├── create_word_reviews.sql
│       └── insert_study_activities.sql
│
├── words.db           # SQLite database file
│
└── docs/             # Documentation
    ├── BackEnd-Technical-Specs.md
    ├── FrontEnd-Technical_Specs.md
    └── Readme.md

## Database Schema:

We have the following tables:

- words - stored vocabulary words
   - id - integer primary key
   - word_arabic - string   
   - word_english - string
   - word_transliteration - string
   - parts_of_speech - string
   - gender - string
   - pronounciation - string

- word_groups - join table for words and groups many-to-many
  - id
  - word_id - integer
  - group_id - integer

- groups - thematic groups of words
  - id - integer primary key
  - name - string

- study_sessions - records of study sessions grouping word_review_items
  - id - integer primary key
  - group_id - integer
  - created_at datetime
  - study_activity_id - integer

- study_activities - a specific study activity, linking study session to  
  a  group.
  - id - integer primary key
  - study_session_id - integer
  - group_id - integer
  - created_at datetime

- word_review_items - a record of word practice, determining if the word  
was correct or not.
  - id - integer primary key
  - word_id - integer
  - study_session_id - integer
  - correct - boolean

## API Endpoints:

### GET /api/dashboard/last_study_session

Returns information about the most recent study session.

#### JSONResponse:

```json
{
  
    "id": 1,
    "created_at": "2025-02-19T19:29:52",
    "group_id": 1,
    "group_name": "Basic Vocabulary",
    "study_activity_id": 20,
      }
```
### GET /api/dashboard/study_progress

 Returns the user's study progress over time.

#### JSONResponse:

```json
{
  
    {

      "total_words_studied": 3,
      "total_available_words": 40,
      
    }
}
```

 ### GET /api/dashboard/quick_stats
 Returns key statistics about the user's overall learning progress.

#### JSONResponse:
```json
{
  "success_rate": 80.0,
  "total_study_sessions": 4,
  "total_active_groups": 3,
  "study_streak_days": 4

}
```

 ### GET /api/study_activities/:id
 Returns details about a specific study activity.

#### JSONResponse:

```json
{
  "id": 1,
  "name": "Vocabulary Quiz",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "description": "Practice your vocabulary with flashcards"
}
```
 ### GET /api/study_activities/:id/study-sessions
 Returns a list of study sessions for a specific study activity.
 pagination with 100 items per page

#### JSONResponse:

```json
{
  "items": [
    {
      "id": 123,
      "activity_name": "Vocabulary Quiz",
      "group_name": "Basic Greetings",
      "start_time": "2025-02-08T17:20:23-05:00",
      "end_time": "2025-02-08T17:30:23-05:00",
      "review_items_count": 20
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 20
  }
}
```

 ### POST /api/study_activities

 #### Request Params
 group_id integer
 study_activity_id integer
 #### JSON Response
 { "id": 124, "group_id": 123 }

   
 -GET /api/words
  - pagination with 100 items per page
  #### JSON Response

```json
{
  "words": [
    {
      "id": 1,
      "word_arabic": "كتاب",
      "word_english": "book",
      "word_transliteration": "kitab",
      "parts_of_speech": "noun",
      "gender": "masculine",
      "pronounciation": "ki-taab"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 1000
  }
}
```

 ### GET /api/words/:id

 #### JSON Response

```json
{
  "id": 1,
  "word_arabic": "كتاب",
  "word_english": "book",
  "word_transliteration": "kitab",
  "parts_of_speech": "noun",
  "gender": "masculine",
  "pronounciation": "ki-taab"
}
```
 ### GET /api/groups
  - pagination with 100 items per page
  #### JSON Response

```json
  {
  "items": [
    {
      "id": 1,
      "name": "Basic Greetings",
      "word_count": 20
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 10,
    "items_per_page": 100
  }
}
```

  -### GET /api/groups/:id
#### JSON Response
```json
{
  "id": 1,
  "name": "Basic Greetings",
  "stats": {
    "total_word_count": 20
  }
}
```

### GET /api/groups/:id/words
#### JSON Response
```json
{
  "items": [
    {
      "word_arabic": "كتاب",
      "word_english": "book",
      "word_transliteration": "kitab",
      "correct_count": 5,
      "wrong_count": 2
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 20,
    "items_per_page": 100
  }
}
```

### GET /api/groups/:id/study_sessions
#### JSON Response
```json
{
  "items": [
    {
      "id": 123,
      "activity_name": "Vocabulary Quiz",
      "group_name": "Basic Greetings",
      "start_time": "2025-02-08T17:20:23-05:00",
      "end_time": "2025-02-08T17:30:23-05:00",
      "review_items_count": 20
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 5,
    "items_per_page": 100
  }
}
```

### GET /api/study_sessions
- pagination with 100 items per page
#### JSON Response
```json
{
  "items": [
    {
      "id": 123,
      "activity_name": "Vocabulary Quiz",
      "group_name": "Basic Greetings",
      "start_time": "2025-02-08T17:20:23-05:00",
      "end_time": "2025-02-08T17:30:23-05:00",
      "review_items_count": 20
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 100
  }
}
```

### GET /api/study_sessions/:id
#### JSON Response
```json
{
  "id": 123,
  "activity_name": "Vocabulary Quiz",
  "group_name": "Basic Greetings",
  "start_time": "2025-02-08T17:20:23-05:00",
  "end_time": "2025-02-08T17:30:23-05:00",
  "review_items_count": 20
}
```

### GET /api/study_sessions/:id/words
- pagination with 100 items per page
#### JSON Response
```json
{
  "items": [
    {
      "word_arabic": "كتاب",
      "word_english": "book",
      "word_transliteration": "kitab",
      "correct_count": 5,
      "wrong_count": 2
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 20,
    "items_per_page": 100
  }
}
```

### POST /api/reset_history
#### JSON Response
```json
{
  "success": true,
  "message": "Study history has been reset"
}
```

### POST /api/full_reset
#### JSON Response
```json
{
  "success": true,
  "message": "System has been fully reset"
}
```

### POST /api/study_sessions/:id/words/:word_id/review
#### Request Params
- id (study_session_id) integer
- word_id integer
- correct boolean

#### Request Payload
```json
{
  "correct": true
}
```

#### JSON Response
```json
{
  "success": true,
  "word_id": 1,
  "study_session_id": 123,
  "correct": true,
  "created_at": "2025-02-08T17:33:07-05:00"
}
```
## Task Runner Tasks

Lets list out possible tasks we need for our lang portal.

### Initialize Database
This task will initialize the sqlite database called `words.db`

```sh
invoke init-db
```

### Migrate Database
This task will run a series of migrations sql files on the database
```sh
invoke migrate
```

Migrations live in the `migrations` folder.
The migration files will be run in order of their file name.
The file names should looks like this:

```sql
0001_init.sql
0002_create_words_table.sql
```

### Seed Data
This task will import json files and transform them into target data for our database.

All seed files live in the `seeds` folder.

In our task we should have DSL to specific each seed file and its expected group word name.

```json
[
  {
    "arabic": "كتاب",
    "transliteration": "kitab",
    "english": "book"
  }

]
```

   -