// src/preload/index.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'

// Define the shape of the user object we'll be passing around
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

export interface ITodoAPI {
  getTodos: () => Promise<{ success: boolean; todos?: Todo[]; error?: string }>
  addTodo: (content: string) => Promise<{ success: boolean; todo?: Todo; error?: string }>
  toggleTodo: (id: number) => Promise<{ success: boolean; error?: string }>
  deleteTodo: (id: number) => Promise<{ success: boolean; error?: string }>
}
// Define the shape of our custom API
export interface IAuthAPI {
  login: (credentials: { email; password }) => Promise<{ success: boolean; user?: User; error?: string }>
  checkSession: () => Promise<{ isLoggedIn: boolean; user?: User }>
  logout: () => Promise<{ success: boolean }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IAuthAPI & ITodoAPI // Use our new interface here
  }
}