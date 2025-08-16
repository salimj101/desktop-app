// src/main/lib/session.db.ts
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

const dbPath = path.join(app.getPath('userData'), 'app-data.sqlite') // Renamed for clarity
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

// Create session table (no changes)
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS session (
    id INTEGER PRIMARY KEY,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt DATETIME,
    refreshTokenExpiresAt DATETIME,
    userId TEXT UNIQUE,
    email TEXT,
    userType TEXT
  );
`)

// NEW: Create todos table
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export const getSession = () => {
  return db.prepare('SELECT * FROM session WHERE id = 1').get()
}

export const clearSession = () => {
  return db.prepare('DELETE FROM session WHERE id = 1').run()
}

export const getSessionDb = () => db