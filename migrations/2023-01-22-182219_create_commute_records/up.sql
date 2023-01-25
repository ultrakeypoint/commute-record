-- Your SQL goes here
CREATE TABLE commute_records (
  id INTEGER PRIMARY KEY,
  commute_date TEXT NOT NULL,
  commute_in_time TEXT,
  commute_out_time TEXT
);