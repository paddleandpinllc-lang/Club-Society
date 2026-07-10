CREATE TABLE IF NOT EXISTS paddle_pint_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT,
  shirt_gender TEXT,
  shirt_size TEXT,
  optional_shirt_choice TEXT,
  selected_shirt TEXT,
  additional_players_json TEXT,
  notes TEXT,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
