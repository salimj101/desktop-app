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
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
}