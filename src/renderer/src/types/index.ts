// Shared types for the Git Tracker Desktop App

export interface Repository {
  _id: string
  name: string
  description?: string
  path: string
  projectId: string
  projectName?: string
  lastSync?: string
  status: 'active' | 'inactive' | 'error'
}

export interface Project {
  _id: string
  name: string
  description?: string
}

export interface Commit {
  _id: string
  hash: string
  message: string
  author: string
  email: string
  date: string
  repository: string
  changes?: {
    files: string[]
    additions: number
    deletions: number
  }
}

export interface Board {
  _id: string
  name: string
  description?: string
  isPublic: boolean
  columns: Column[]
  createdAt: string
  updatedAt: string
}

export interface Column {
  _id: string
  name: string
  order: number
  cards: Card[]
}

export interface Card {
  _id: string
  title: string
  description?: string
  order: number
  columnId: string
  createdAt: string
  updatedAt: string
}

export interface Todo {
  id: number
  content: string
  completed: boolean
  createdAt: string
}

export interface User {
  _id: string
  username: string
  email: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
