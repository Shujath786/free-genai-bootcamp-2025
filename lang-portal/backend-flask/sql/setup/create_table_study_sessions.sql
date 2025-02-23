CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,      -- The word being studied
    group_id INTEGER NOT NULL,     -- The group of words being studied
    activity_id INTEGER NOT NULL,  -- The activity performed
    correct BOOLEAN NOT NULL,      -- Whether the answer was correct
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When the session occurred
    FOREIGN KEY (word_id) REFERENCES words(id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (activity_id) REFERENCES study_activities(id)
);