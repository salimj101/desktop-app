// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import cron from 'node-cron' // Your chosen scheduler

import { checkAndRefreshSession, login } from './lib/auth.service'
import { clearSession } from './lib/session.db'
import * as todoService from './lib/todo.service'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Re-check session when the window is focused
  mainWindow.on('focus', () => {
    console.log('--- Window Focused: Validating session ---')
    checkAndRefreshSession().catch((err) => {
      console.error('Background session refresh failed:', (err as Error).message)
      mainWindow.webContents.send('session-expired')
    })
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // --- AUTH IPC HANDLERS ---

  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const user = await login(email, password)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // The single, correct handler for checking the session.
  ipcMain.handle('session:check', async () => {
    try {
      const user = await checkAndRefreshSession()
      return { isLoggedIn: true, user }
    } catch (error) {
      console.log(`[Session Check Failed]: ${(error as Error).message}`)
      return { isLoggedIn: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('auth:logout', () => {
    try {
      clearSession()
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // --- TODO IPC HANDLERS ---
  ipcMain.handle('todos:get', async () => {
    try {
      const user = await checkAndRefreshSession()
      const todos = todoService.getTodosForUser(user.userId)
      return { success: true, todos }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('todos:add', async (_, content: string) => {
    try {
      const user = await checkAndRefreshSession()
      const newTodo = todoService.addTodo(user.userId, content)
      return { success: true, todo: newTodo }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('todos:toggle', async (_, todoId: number) => {
    try {
      const user = await checkAndRefreshSession()
      await todoService.toggleTodo(user.userId, todoId)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('todos:delete', async (_, todoId: number) => {
    try {
      const user = await checkAndRefreshSession()
      await todoService.deleteTodo(user.userId, todoId)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // --- SCHEDULER (Background task runner) ---
  // Schedule a task to run every 30 minutes.
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] Running scheduled 30-minute task...')
    try {
      // Step 1: Verify the session is valid before doing anything.
      await checkAndRefreshSession()

      // Step 2: If the session is valid, proceed with the task.
      console.log('[Scheduler] Session is valid. Syncing git commits now...')
      // TODO: Implement your actual git sync logic here.
      console.log('[Scheduler] Git sync task completed.')
    } catch (error) {
      // Step 3: If the session is invalid or refresh fails, log it and do nothing.
      console.error(
        '[Scheduler] Could not perform task, session is invalid:',
        (error as Error).message
      )
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})