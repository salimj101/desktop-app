// src/main/lib/todo.service.ts
import { getDb } from './database'

const db = getDb()

// All functions require a userId to ensure a user can only access their own todos.

export const getTodosForUser = (userId: string) => {
  return db.prepare('SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC').all(userId)
}

export const addTodo = (userId: string, content: string) => {
  const result = db
    .prepare('INSERT INTO todos (userId, content) VALUES (?, ?)')
    .run(userId, content)
  // Return the newly created todo
  return db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid)
}

export const toggleTodo = (userId: string, todoId: number) => {
  // The 'AND userId = ?' is a critical security check
  db.prepare('UPDATE todos SET completed = NOT completed WHERE id = ? AND userId = ?').run(
    todoId,
    userId
  )
  return { id: todoId, success: true }
}

export const deleteTodo = (userId: string, todoId: number) => {
  db.prepare('DELETE FROM todos WHERE id = ? AND userId = ?').run(todoId, userId)
  return { id: todoId, success: true }
}
