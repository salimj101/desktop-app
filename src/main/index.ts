import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import cron from 'node-cron' // scheduler

import { checkAndRefreshSession, login } from './lib/auth.service'
import { clearSession } from './lib/database'
import * as todoService from './lib/todo.service'
import * as kanbanService from './lib/kanban.service' // Kanban service

import { registerGitHandlers } from './ipcHandlers/git.handlers' // Import the new handlers
import logger from './lib/logger'
import GitServices from './lib/git.service'

// Create the main application window
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // keep sandbox false if your preload relies on contextBridge; adjust as needed
      sandbox: false
      // IMPORTANT: contextIsolation should be enabled in your BrowserWindow options in production builds,
      // and nodeIntegration must be false. If you set them explicitly elsewhere, ensure they're configured.
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Open links externally
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

  /**
   * createSecureHandler
   * Wraps service functions that expect (userId, data) or (user, data).
   * Ensures session is checked and returns a consistent { success, result?, error? } shape.
   *
   * Usage:
   *   ipcMain.handle('some:channel', createSecureHandler(async (userId, data) => { ... }))
   *
   * The service function should return any value (object, array, primitive) — it will be wrapped
   * under `result`.
   */
  const createSecureHandler =
    (serviceFn: (userId: string, data?: any) => Promise<any> | any) =>
    async (_event: any, data?: any) => {
      try {
        const user = await checkAndRefreshSession()
        // Ensure userId is passed as a string
        const result = await Promise.resolve(serviceFn(String(user.userId), data))
        return { success: true, result }
      } catch (error) {
        const message = (error as Error).message ?? 'Unknown error'
        console.error('[SecureHandler Error]', message)
        return { success: false, error: message }
      }
    }

  // --- AUTH IPC HANDLERS ---
  ipcMain.handle(
    'auth:login',
    async (_event, { email, password }: { email: string; password: string }) => {
      try {
        const user = await login(email, password)
        return { success: true, user }
      } catch (error) {
        const message = (error as Error).message ?? 'Login failed'
        console.error('[auth:login] error', message)
        return { success: false, error: message }
      }
    }
  )

  // Single session check handler
  ipcMain.handle('session:check', async () => {
    try {
      const user = await checkAndRefreshSession()
      return { isLoggedIn: true, user }
    } catch (error) {
      const message = (error as Error).message ?? 'Session invalid'
      console.log(`[Session Check Failed]: ${message}`)
      return { isLoggedIn: false, error: message }
    }
  })

  ipcMain.handle('auth:logout', async () => {
    try {
      await clearSession()
      return { success: true }
    } catch (error) {
      const message = (error as Error).message ?? 'Logout failed'
      console.error('[auth:logout] error', message)
      return { success: false, error: message }
    }
  })

  // --- TODO IPC HANDLERS ---
  ipcMain.handle('todos:get', async () => {
    try {
      const user = await checkAndRefreshSession()
      // allow todoService to be sync or async
      const todos = await Promise.resolve(todoService.getTodosForUser(user.userId))
      return { success: true, todos }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to fetch todos'
      console.error('[todos:get] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('todos:add', async (_event, content: string) => {
    try {
      const user = await checkAndRefreshSession()
      const newTodo = await Promise.resolve(todoService.addTodo(user.userId, content))
      return { success: true, todo: newTodo }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to add todo'
      console.error('[todos:add] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('todos:toggle', async (_event, todoId: number) => {
    try {
      const user = await checkAndRefreshSession()
      await Promise.resolve(todoService.toggleTodo(user.userId, todoId))
      return { success: true }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to toggle todo'
      console.error('[todos:toggle] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('todos:delete', async (_event, todoId: number) => {
    try {
      const user = await checkAndRefreshSession()
      await Promise.resolve(todoService.deleteTodo(user.userId, todoId))
      return { success: true }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to delete todo'
      console.error('[todos:delete] error', message)
      return { success: false, error: message }
    }
  })

  // --- KANBAN IPC HANDLERS ---
  // Note: kanbanService functions can be sync or async; we await them consistently.
  ipcMain.handle('kanban:getBoards', async () => {
    try {
      const user = await checkAndRefreshSession()
      const boards = await Promise.resolve(kanbanService.getBoardsForUser(user.userId))
      return { success: true, boards }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to get kanban boards'
      console.error('[kanban:getBoards] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('kanban:getPublicBoards', async () => {
    try {
      // public listing may not require a logged-in user; if you want to allow only logged-in users,
      // uncomment the next line. For now we check session optionally to refresh tokens:
      try {
        await checkAndRefreshSession()
      } catch {
        // ignore session errors for public listing (optional)
      }
      const boards = await Promise.resolve(kanbanService.getPublicBoards())
      return { success: true, boards }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to get public boards'
      console.error('[kanban:getPublicBoards] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('kanban:getBoardDetails', async (_event, boardId: number) => {
    try {
      const user = await checkAndRefreshSession()
      const board = await Promise.resolve(kanbanService.getBoardDetails(boardId, user.userId))
      return { success: true, board }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to get board details'
      console.error('[kanban:getBoardDetails] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('kanban:createBoard', async (_event, data) => {
    try {
      const user = await checkAndRefreshSession()
      const board = await Promise.resolve(kanbanService.createBoard(user, data))
      return { success: true, board }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to create board'
      console.error('[kanban:createBoard] error', message)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('kanban:addColumn', async (_event, data) => {
    try {
      const user = await checkAndRefreshSession()
      const column = await Promise.resolve(kanbanService.addColumn(user.userId, data))
      return { success: true, column }
    } catch (error) {
      const message = (error as Error).message ?? 'Failed to add column'
      console.error('[kanban:addColumn] error', message)
      return { success: false, error: message }
    }
  })

  // Secure handlers using createSecureHandler for operations that follow pattern (userId, data)
  ipcMain.handle('kanban:updateBoard', createSecureHandler(kanbanService.updateBoard))
  ipcMain.handle('kanban:deleteBoard', createSecureHandler(kanbanService.deleteBoard))
  ipcMain.handle('kanban:createCard', createSecureHandler(kanbanService.createCard))
  ipcMain.handle('kanban:updateCardContent', createSecureHandler(kanbanService.updateCardContent))
  ipcMain.handle('kanban:deleteCard', createSecureHandler(kanbanService.deleteCard))
  ipcMain.handle('kanban:moveCard', createSecureHandler(kanbanService.moveCard))

  // --- REGISTER ALL GIT HANDLERS ---
  registerGitHandlers();

  // --- SCHEDULER (Background task runner) ---
  // Schedule a task to run every 30 minutes.
  cron.schedule('*/30 * * * *', async () => {
    logger.info('[Scheduler] Running 30-minute sync task...');
    try {
      const session = await checkAndRefreshSession();
      const repos = await GitServices.getAllLocalRepositories(session.userId);
      for (const repo of repos) {
        logger.info(`[Scheduler] Syncing repo: ${repo.name}`);
        // Extract new commits locally
        await GitServices.extractNewCommits(repo.repoId, session.userId);
        // Push unsynced commits to backend
        // We will do that later
     }
      logger.info('[Scheduler] Background task completed.');
    } catch (error) {
      // Session invalid or refresh failed: log and skip
      logger.error(
        '[Scheduler] Could not perform task, session is invalid');
    }
  })

  // Create the window after handlers are registered
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}) // end app.whenReady()

// Properly quit the app on all windows closed (except macOS conventions)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
