// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Auth functions
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  checkSession: () => ipcRenderer.invoke('session:check'),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // NEW: Todo functions
  getTodos: () => ipcRenderer.invoke('todos:get'),
  addTodo: (content) => ipcRenderer.invoke('todos:add', content),
  toggleTodo: (id) => ipcRenderer.invoke('todos:toggle', id),
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id),

  // --- NEW KANBAN FUNCTIONS ---
  getBoards: () => ipcRenderer.invoke('kanban:getBoards'),
  getPublicBoards: () => ipcRenderer.invoke('kanban:getPublicBoards'),
  getBoardDetails: (id) => ipcRenderer.invoke('kanban:getBoardDetails', id),
  createBoard: (data) => ipcRenderer.invoke('kanban:createBoard', data),
  addColumn: (data) => ipcRenderer.invoke('kanban:addColumn', data),
  createCard: (data) => ipcRenderer.invoke('kanban:createCard', data),
  updateCardContent: (data) => ipcRenderer.invoke('kanban:updateCardContent', data),
  deleteCard: (cardId) => ipcRenderer.invoke('kanban:deleteCard', cardId),
  moveCard: (data) => ipcRenderer.invoke('kanban:moveCard', data),
  updateBoard: (data) => ipcRenderer.invoke('kanban:updateBoard', data),
  deleteBoard: (boardId) => ipcRenderer.invoke('kanban:deleteBoard', boardId),
  registerRepo: (data) => ipcRenderer.invoke('git:registerRepo', data),
  extractCommits: (repoId) => ipcRenderer.invoke('git:extractCommits', repoId),
  getRepositoriesView: () => ipcRenderer.invoke('git:getRepositoriesView'),
  syncCommits: (repoId) => ipcRenderer.invoke('git:syncCommits', repoId),
  getMyProjects: () => ipcRenderer.invoke('git:getMyProjects'),
  selectDirectory: () => ipcRenderer.invoke('git:selectDirectory'),
  // --- NEW FUNCTIONS ---
  getLocalRepoDetails: (repoId) => ipcRenderer.invoke('git:getLocalRepoDetails', repoId),
  updateAndValidateRepoPath: (data) => ipcRenderer.invoke('git:updateAndValidateRepoPath', data),
  setupMissingLocalRepo: (data) => ipcRenderer.invoke('git:setupMissingLocalRepo', data),
  updateRepoDetails: (data) => ipcRenderer.invoke('git:updateRepoDetails', data),
  checkAllRepoHealth: () => ipcRenderer.invoke('git:checkAllRepoHealth'),
  syncRepoStatus: (repoId) => ipcRenderer.invoke('git:syncRepoStatus', repoId),
  // Commits page
  getCommits: () => ipcRenderer.invoke('getCommits')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
}
