// src/preload/index.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'

// Define the shape of the user object we'll be passing around
export interface Commit {
  id: string
  message: string
  author: string
  date: string
}

export interface User {
  userId: string
  email: string
  userType: string
}

export interface Todo {
  id: number
  userId: string
  content: string
  completed: boolean
  createdAt: string
}

export interface Card {
  id: number
  columnId: number
  content: string
  order: number
}
export interface Column {
  id: number
  boardId: number
  name: string
  order: number
  cards: Card[]
}
export interface Board {
  id: number
  userId: string
  name: string
  authorEmail: string
  visibility: 'private' | 'public'
  createdAt: string
  columns?: Column[]
}
export interface PublicBoard {
  id: number
  name: string
  createdAt: string
  authorEmail: string
}

export interface ITodoAPI {
  getTodos: () => Promise<{ success: boolean; todos?: Todo[]; error?: string }>
  addTodo: (content: string) => Promise<{ success: boolean; todo?: Todo; error?: string }>
  toggleTodo: (id: number) => Promise<{ success: boolean; error?: string }>
  deleteTodo: (id: number) => Promise<{ success: boolean; error?: string }>
}
// Define the shape of our custom API
export interface IAuthAPI {
  login: (credentials: {
    email
    password
  }) => Promise<{ success: boolean; user?: User; error?: string }>
  checkSession: () => Promise<{ isLoggedIn: boolean; user?: User }>
  logout: () => Promise<{ success: boolean }>
}

export interface IKanbanAPI {
  getBoards: () => Promise<{ success: boolean; boards?: Board[] }>
  getPublicBoards: () => Promise<{ success: boolean; boards?: PublicBoard[] }>
  getBoardDetails: (id: number) => Promise<{ success: boolean; board?: Board }>
  createBoard: (data: {
    name: string
    visibility: 'private' | 'public'
    columns: string[]
  }) => Promise<{ success: boolean; board?: Board }>
  updateBoard: (data: {
    boardId: number
    name: string
    visibility: 'private' | 'public'
  }) => Promise<{ success: boolean }>
  deleteBoard: (boardId: number) => Promise<{ success: boolean }>
  createCard: (data: {
    columnId: number
    content: string
  }) => Promise<{ success: boolean; card?: Card }>
  updateCardContent: (data: { cardId: number; content: string }) => Promise<{ success: boolean }>
  deleteCard: (cardId: number) => Promise<{ success: boolean }>
  moveCard: (data: {
    cardId: number
    newColumnId: number
    newOrder: number
  }) => Promise<{ success: boolean }>
}

export interface IGitAPI {
  extractCommits: (repoId: string) => Promise<{ success: boolean; data?: Commit[]; error?: string }>
  registerRepo: (data: {
    name: string
    description: string
    path: string
    projectId: string
  }) => Promise<{
    success: boolean
    data?: { repoId: string; name: string; description: string }[]
    error?: string
  }>
  extractCommits: (repoId: string) => Promise<{ success: boolean; data?: Commit[]; error?: string }>
  getRepositoriesView: () => Promise<{
    success: boolean
    status?: string
    repositories?: { id: string; name: string; description: string; path: string }[]
    error?: string
  }>
  syncCommits: (
    repoId: string
  ) => Promise<{ success: boolean; data?: Commit[]; error?: string; message?: string }>
  getMyProjects: () => Promise<{
    success: boolean
    data?: { projectId: string; name: string; description: string }[]
    error?: string
  }>
  // --- NEW FUNCTIONS ---
  getLocalRepoDetails: (repoId: string) => Promise<{
    success: boolean
    data?: { repoId: string; name: string; path: string; lastSynced: string }
    error?: string
  }>
  updateAndValidateRepoPath: (data: {
    repoId: string
    newPath: string
    remoteFingerprint: string
  }) => Promise<{ success: boolean; error?: string }>
  setupMissingLocalRepo: (data: {
    remoteRepo: { id: string; name: string; url: string } // Replace with the actual structure of remoteRepo
    localPath: string
  }) => Promise<{ success: boolean; error?: string }>
  updateRepoDetails: (data: {
    repoId: string
    name: string
    description: string
  }) => Promise<{ success: boolean; error?: string }>
  checkAllRepoHealth: () => Promise<{
    success: boolean
    totalChecked?: number
    data?: { repoId: string; status: string; details: string }[]
    error?: string
  }>
  syncRepoStatus: (repoId: string) => Promise<{
    success: boolean
    repoId?: string
    localStatus?: string
    remoteStatus?: string
    remoteResult?: { ok: boolean; error?: string } | null
    error?: string
  }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IAuthAPI & ITodoAPI & IKanbanAPI & IGitAPI // Use our new interface here
  }
}
