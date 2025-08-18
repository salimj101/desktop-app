// src/main/lib/database.ts (or session.db.ts)
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

const dbPath = path.join(app.getPath('userData'), 'app-data.sqlite')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

// --- SCHEMA DEFINITIONS ---

// Session Table
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

// Todo Table
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Kanban Tables
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    authorEmail TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    boardId INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
  );
`)
db.exec(/* sql */ `
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    columnId INTEGER NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    FOREIGN KEY (columnId) REFERENCES columns(id) ON DELETE CASCADE
  );
`)

// --- GIT FEATURE TABLES (Corrected Syntax) ---
db.exec(/* sql */`
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repoId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    path TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    developerId TEXT,
    projectId TEXT,
    permission TEXT,
    repoFingerprint TEXT NOT NULL,
    lastSyncedAt DATETIME DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

db.exec(/* sql */`
  CREATE TABLE IF NOT EXISTS git_commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repoId TEXT NOT NULL,
    developerId TEXT,
    projectId TEXT,
    branch TEXT NOT NULL,
    message TEXT NOT NULL,
    commitHash TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    stats TEXT, -- JSON string
    changes TEXT, -- JSON string
    parentCommit TEXT,
    synced BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(commitHash, projectId, developerId)
  );
`)

// --- EXPORTED FUNCTIONS ---
export const getSession = () => {
  return db.prepare('SELECT * FROM session WHERE id = 1').get()
}

export const clearSession = () => {
  return db.prepare('DELETE FROM session WHERE id = 1').run()
}

// The main database connection export
export const getDb = () => db