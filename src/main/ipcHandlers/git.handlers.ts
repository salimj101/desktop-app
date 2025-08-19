// IPC: Check health of all local repositories (path, git, fingerprint)

// src/main/ipcHandlers/git.handlers.ts
import { dialog, ipcMain } from 'electron'
import { checkAndRefreshSession } from '../lib/auth.service'
import GitServices from '../lib/git.service'
import axios from 'axios'
import logger from '../lib/logger'
import { getDb } from '../lib/database'

// Use an environment variable for the backend URL
const backendApi = axios.create({ baseURL: 'http://localhost:3001/api' })

// Helper factory for creating secure handlers
const createSecureHandler = (serviceFn) => async (_, data) => {
  try {
    const user = await checkAndRefreshSession()
    // Pass both userId and the data payload to the service function
    const result = await serviceFn(user.userId, data)
    return { success: true, data: result }
  } catch (error: any) {
    logger.error(`[secureHandler] ${error.message}`)
    return { success: false, error: error.message }
  }
}

export function registerGitHandlers(): void {
  // IPC: Get all commits from local sqlite
  ipcMain.handle('getCommits', async () => {
    try {
      const db = getDb()
      // Get all repos with their commit counts
      const repos = db.prepare('SELECT repoId, name FROM repositories').all()
      const repoCommits = repos.map((repo) => {
        const commits = db
          .prepare('SELECT * FROM git_commits WHERE repoId = ? ORDER BY timestamp DESC')
          .all(repo.repoId)
        return {
          repoId: repo.repoId,
          repoName: repo.name,
          totalCommits: commits.length,
          commits
        }
      })
      return { success: true, data: repoCommits }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  })
  ipcMain.handle('git:checkAllRepoHealth', async () => {
    logger.info('[git:checkAllRepoHealth] Starting full repo health check...')
    try {
      const session = await checkAndRefreshSession()
      logger.info(`[git:checkAllRepoHealth] Session userId: ${session.userId}`)
      const localStatuses = await GitServices.checkAllLocalRepoStatuses(session.userId, {
        validateFingerprint: true
      })
      logger.info(`[git:checkAllRepoHealth] Got ${localStatuses.length} local repo statuses`)
      if (!localStatuses || localStatuses.length === 0) {
        logger.info('[git:checkAllRepoHealth] No local repositories found to check.')
        return { success: true, message: 'No local repositories found to check.', data: [] }
      }
      type RepoHealthSummary = { repoId: string; path: string; status: string; message: string }
      type RemoteUpdate = { repoId: string; status: string; ok: boolean; error?: string }
      const summary: RepoHealthSummary[] = []
      const remoteUpdates: RemoteUpdate[] = []
      for (const repoStatus of localStatuses) {
        logger.info(
          `[git:checkAllRepoHealth] Repo ${repoStatus.repoId} status: ${repoStatus.status} (${repoStatus.message || ''})`
        )
        try {
          // Always update local DB status, mapping fingerprint_mismatch to moved after sync
          let localStatus = repoStatus.status
          let remoteStatus = repoStatus.status
          if (repoStatus.status === 'fingerprint_mismatch') {
            remoteStatus = 'moved'
          }
          // PATCH remote backend if unhealthy
          if (['missing', 'moved', 'deleted'].includes(remoteStatus)) {
            try {
              const updateDto = { status: remoteStatus, developerId: session.userId }
              logger.info(
                `[git:checkAllRepoHealth] PATCH /repositories/${repoStatus.repoId} payload: ${JSON.stringify(updateDto)}`
              )
              const response = await axios.patch(
                `${process.env.BACKEND_API_URL || 'http://localhost:3001/api'}/repositories/${repoStatus.repoId}`,
                updateDto,
                { headers: { Authorization: `Bearer ${session.accessToken}` } }
              )
              logger.info(
                `[git:checkAllRepoHealth] PATCH response: ${JSON.stringify(response.data)}`
              )
              remoteUpdates.push({ repoId: repoStatus.repoId, status: remoteStatus, ok: true })
              // If fingerprint_mismatch, update local DB to moved
              if (repoStatus.status === 'fingerprint_mismatch') {
                await GitServices.updateLocalRepoStatus(repoStatus.id, 'moved')
                localStatus = 'moved'
              } else {
                await GitServices.updateLocalRepoStatus(repoStatus.id, repoStatus.status)
              }
            } catch (remoteErr) {
              const remoteMsg =
                remoteErr instanceof Error ? remoteErr.message : 'Unknown remote error'
              remoteUpdates.push({
                repoId: repoStatus.repoId,
                status: remoteStatus,
                ok: false,
                error: remoteMsg
              })
              logger.error(
                `[git:checkAllRepoHealth] Failed to patch remote for repo ${repoStatus.repoId}: ${remoteMsg}`
              )
              // Still update local DB to moved if fingerprint_mismatch
              if (repoStatus.status === 'fingerprint_mismatch') {
                await GitServices.updateLocalRepoStatus(repoStatus.id, 'moved')
                localStatus = 'moved'
              } else {
                await GitServices.updateLocalRepoStatus(repoStatus.id, repoStatus.status)
              }
            }
          } else {
            // Not unhealthy, just update local DB
            await GitServices.updateLocalRepoStatus(repoStatus.id, repoStatus.status)
          }
          summary.push({
            repoId: repoStatus.repoId,
            path: repoStatus.path,
            status: localStatus,
            message: repoStatus.message || ''
          })
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to update local DB status.'
          logger.error(
            `[git:checkAllRepoHealth] Failed to update DB for repo ${repoStatus.repoId}: ${errorMsg}`
          )
          summary.push({
            repoId: repoStatus.repoId,
            path: repoStatus.path,
            status: 'error',
            message: errorMsg
          })
        }
      }
      logger.info(
        `[git:checkAllRepoHealth] Health check summary: ${JSON.stringify(summary, null, 2)}`
      )
      logger.info(
        `[git:checkAllRepoHealth] Remote update summary: ${JSON.stringify(remoteUpdates, null, 2)}`
      )
      return {
        success: true,
        totalChecked: localStatuses.length,
        data: summary,
        remoteUpdates
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`[git:checkAllRepoHealth] ERROR: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  })
  // Individual repo health check and remote sync (moved out of loop)
  ipcMain.handle('git:syncRepoStatus', async (_, repoId: string) => {
    logger.info(`[git:syncRepoStatus] Checking and syncing status for repoId: ${repoId}`)
    try {
      const session = await checkAndRefreshSession()
      const db = getDb()
      const repo = db.prepare('SELECT * FROM repositories WHERE repoId = ?').get(repoId)
      if (!repo) {
        logger.warn(`[git:syncRepoStatus] Repo not found in local DB: ${repoId}`)
        return {
          success: false,
          status: 'missing_local',
          message: 'Repository not found locally.'
        }
      }
      // Check health for this repo only
      const [health] = await GitServices.checkAllLocalRepoStatuses(session.userId, {
        validateFingerprint: true
      })
      let remoteStatus = health.status
      let localStatus = health.status
      if (health.status === 'fingerprint_mismatch') {
        remoteStatus = 'moved'
      }
      let remoteResult: { ok: boolean; error?: string } | null = null
      if (['missing', 'moved', 'deleted'].includes(remoteStatus)) {
        try {
          const updateDto = { status: remoteStatus, developerId: session.userId }
          logger.info(
            `[git:syncRepoStatus] PATCH /repositories/${repoId} payload: ${JSON.stringify(updateDto)}`
          )
          const response = await axios.patch(
            `${process.env.BACKEND_API_URL || 'http://localhost:3001/api'}/repositories/${repoId}`,
            updateDto,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          )
          logger.info(`[git:syncRepoStatus] PATCH response: ${JSON.stringify(response.data)}`)
          remoteResult = { ok: true }
          // If fingerprint_mismatch, update local DB to moved
          if (health.status === 'fingerprint_mismatch') {
            await GitServices.updateLocalRepoStatus(repo.id, 'moved')
            localStatus = 'moved'
          } else {
            await GitServices.updateLocalRepoStatus(repo.id, health.status)
          }
        } catch (remoteErr) {
          const remoteMsg = remoteErr instanceof Error ? remoteErr.message : 'Unknown remote error'
          remoteResult = { ok: false, error: remoteMsg }
          logger.error(
            `[git:syncRepoStatus] Failed to patch remote for repo ${repoId}: ${remoteMsg}`
          )
          // Still update local DB to moved if fingerprint_mismatch
          if (health.status === 'fingerprint_mismatch') {
            await GitServices.updateLocalRepoStatus(repo.id, 'moved')
            localStatus = 'moved'
          } else {
            await GitServices.updateLocalRepoStatus(repo.id, health.status)
          }
        }
      } else {
        // Not unhealthy, just update local DB
        await GitServices.updateLocalRepoStatus(repo.id, health.status)
      }
      return {
        success: true,
        repoId,
        localStatus,
        remoteStatus,
        remoteResult
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`[git:syncRepoStatus] ERROR: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  })
  // IPC: Get a single repository from local DB by repoId
  ipcMain.handle('git:getRepository', async (_, repoId: string) => {
    try {
      const db = getDb()
      const repo = db.prepare('SELECT * FROM repositories WHERE repoId = ?').get(repoId)
      if (!repo) {
        return { success: false, error: 'Repository not found locally.' }
      }
      return { success: true, repository: repo }
    } catch (error: any) {
      logger.error(`[git:getRepository] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // IPC: Get a single repository from remote by repoId
  ipcMain.handle('git:getRemoteRepository', async (_, repoId: string) => {
    let session
    try {
      session = await checkAndRefreshSession()
      const response = await backendApi.get(`/repositories/${repoId}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      const repo = response.data.data
      if (!repo) {
        return { success: false, error: 'Repository not found on remote.' }
      }
      return { success: true, repository: repo }
    } catch (error: any) {
      logger.error(`[git:getRemoteRepository] ${error.message}`)
      return { success: false, error: error.message }
    }
  })
  // Explicit repo status check handler with logs
  ipcMain.handle('git:checkRepoStatus', async (_, repoId: string) => {
    try {
      logger.info(`[git:checkRepoStatus] Checking status for repoId: ${repoId}`)
      const db = getDb()
      const repo = db.prepare('SELECT * FROM repositories WHERE repoId = ?').get(repoId)
      if (!repo) {
        logger.warn(`[git:checkRepoStatus] Repo not found in local DB: ${repoId}`)
        return { success: false, status: 'missing_local', message: 'Repository not found locally.' }
      }
      logger.info(`[git:checkRepoStatus] Local repo found: ${repoId}, status: ${repo.status}`)
      // Optionally, check remote existence if needed (not implemented here)
      return { success: true, status: repo.status, repo }
    } catch (error: any) {
      logger.error(`[git:checkRepoStatus] ${error.message}`)
      return { success: false, error: error.message }
    }
  })
  // Select a directory
  ipcMain.handle('git:selectDirectory', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, path: result.filePaths[0] }
      }
      return { success: false, error: 'No directory selected.' }
    } catch (error: any) {
      logger.error(`[git:selectDirectory] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Register repo
  ipcMain.handle('git:registerRepo', async (_, data) => {
    try {
      const session = await checkAndRefreshSession()
      const repoFingerprint = await GitServices.validateLocalRepository(data.path)
      const payload = { ...data, developerId: session.userId, repoFingerprint }
      const response = await backendApi.post('/repositories/register', payload, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })

      const db = getDb()
      const repoData = response.data.data
      db.prepare(
        `INSERT INTO repositories (repoId, name, description, path, developerId, projectId, permission, repoFingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        repoData._id,
        repoData.name,
        repoData.description,
        repoData.path,
        repoData.developerId,
        repoData.projectId,
        repoData.permission,
        repoData.repoFingerprint
      )

      return { success: true, data: response.data }
    } catch (error: any) {
      logger.error(`[git:registerRepo] ${error.message}`)
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Invalid data.'
        return {
          success: false,
          error: Array.isArray(message) ? message.join(', ') : message
        }
      }
      return { success: false, error: error.message }
    }
  })

  // Extract new commits
  ipcMain.handle('git:extractCommits', async (_, repoId: string) => {
    try {
      const session = await checkAndRefreshSession()
      const newCommits = await GitServices.extractNewCommits(repoId, session.userId)
      return { success: true, data: newCommits }
    } catch (error: any) {
      logger.error(`[git:extractCommits] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Get repositories view (remote + local compare, fallback to offline)
  ipcMain.handle('git:getRepositoriesView', async () => {
    let session
    try {
      session = await checkAndRefreshSession()
      const response = await backendApi.get('/repositories/me/developer', {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      const remoteRepos = response.data.data.repositories
      const compareRes = await GitServices.compareRepositories(session.userId, remoteRepos)
      const consolidatedView = await GitServices.getConsolidatedRepositoryView(
        session.userId,
        compareRes
      )
      // Update DB status for missing local repos
      if (consolidatedView.repositories) {
        for (const repo of consolidatedView.repositories) {
          if (repo.status === 'missing') {
            // If repo has a local DB id, update status
            if (repo.id) {
              await GitServices.updateLocalRepoStatus(repo.id, 'missing')
            }
          }
        }
      }
      logger.info(
        `[git:getRepositoriesView] Returning consolidated repo view. Local status is always from local DB, remote-only repos are marked missing_local.`
      )
      return { success: true, ...consolidatedView }
    } catch (error: any) {
      if (axios.isAxiosError(error) && !error.response && session) {
        logger.warn('[git:getRepositoriesView] Backend unreachable. Falling back to local data.')
        const localRepos = await GitServices.getAllLocalRepositories(session.userId)
        // If any are missing, update their status in DB
        for (const repo of localRepos) {
          if (repo.status === 'missing') {
            if (repo.id) {
              await GitServices.updateLocalRepoStatus(repo.id, 'missing')
            }
          }
        }
        // Map status 'missing' to syncStatus 'missing_local' for UI consistency
        const annotated = localRepos.map((repo) => ({
          ...repo,
          syncStatus: repo.status === 'missing' ? 'missing_local' : 'offline'
        }))
        logger.info(
          `[git:getRepositoriesView] Offline fallback: returning local DB status for all repos. 'missing' means missing_local if remote exists.`
        )
        return { success: true, status: 'offline', repositories: annotated }
      }
      logger.error(`[git:getRepositoriesView] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Sync commits
  ipcMain.handle('git:syncCommits', async (_, repoId: string) => {
    try {
      logger.info(`[git:syncCommits] Starting sync for repoId: ${repoId}`)
      const session = await checkAndRefreshSession()
      await GitServices.extractNewCommits(repoId, session.userId) // Ensure latest commits
      const unsyncedCommits = await GitServices.getUnsyncedCommits(repoId, session.userId)
      logger.info(
        `[git:syncCommits] unsyncedCommits count for repoId ${repoId}: ${unsyncedCommits.length}`
      )
      if (unsyncedCommits.length === 0) {
        logger.info(
          `[git:syncCommits] No unsynced commits for repoId ${repoId}. Skipping backend sync.`
        )
        return { success: true, message: 'Repository is already up-to-date.' }
      }

      // Transform commits payload
      const payload = unsyncedCommits.map((commit: any) => ({
        repoId: commit.repoId,
        developerId: commit.developerId,
        projectId: commit.projectId,
        commitHash: commit.commitHash,
        message: commit.message,
        branch: commit.branch,
        timestamp: commit.timestamp,
        stats: JSON.parse(commit.stats || '{}'),
        changes: JSON.parse(commit.changes || '[]'),
        parentCommit: commit.parentCommit,
        desktopSyncedAt: commit.createdAt
      }))
      logger.info(
        `[git:syncCommits] Payload to backend for repoId ${repoId}: ${JSON.stringify(payload)}`
      )

      const response = await backendApi.post('/git-data/commits', payload, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      logger.info(
        `[git:syncCommits] Backend response for repoId ${repoId}: ${JSON.stringify(response.data)}`
      )

      await GitServices.markCommitsAsSynced(repoId, session.userId)

      return {
        success: true,
        data: response.data,
        message: `Successfully synced ${unsyncedCommits.length} commits.`
      }
    } catch (error: any) {
      logger.error(`[git:syncCommits] ${error.message}`)
      if (axios.isAxiosError(error) && error.response) {
        logger.error(
          `[git:syncCommits] Backend error response: ${JSON.stringify(error.response.data)}`
        )
        const message = error.response.data.message || 'Sync failed.'
        return {
          success: false,
          error: Array.isArray(message) ? message.join(', ') : message
        }
      }
      return { success: false, error: error.message }
    }
  })

  // New handlers
  ipcMain.handle('git:getLocalRepoDetails', createSecureHandler(GitServices.getLocalRepoDetails))
  // Defensive handler for updateAndValidateRepoPath
  ipcMain.handle('git:updateAndValidateRepoPath', async (_, data) => {
    try {
      const user = await checkAndRefreshSession()
      if (!data || !data.repoId || !data.newPath || !data.remoteFingerprint) {
        return {
          success: false,
          error: 'Missing required fields: repoId, newPath, or remoteFingerprint.'
        }
      }
      const result = await GitServices.updateAndValidateRepoPath(user.userId, data)
      return { success: true, data: result }
    } catch (error: any) {
      logger.error(`[git:updateAndValidateRepoPath] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Defensive handler for setupMissingLocalRepo
  ipcMain.handle('git:setupMissingLocalRepo', async (_, data) => {
    try {
      const user = await checkAndRefreshSession()
      if (!data || !data.remoteRepo || !data.localPath) {
        return { success: false, error: 'Missing required fields: remoteRepo or localPath.' }
      }
      if (!data.remoteRepo.repoFingerprint) {
        return { success: false, error: 'Remote fingerprint is required for setup.' }
      }
      const result = await GitServices.setupMissingLocalRepo(user.userId, data)
      return { success: true, data: result }
    } catch (error: any) {
      logger.error(`[git:setupMissingLocalRepo] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Projects for dropdowns
  ipcMain.handle('git:getMyProjects', async () => {
    try {
      const session = await checkAndRefreshSession()
      try {
        const response = await backendApi.get('/users/developers/me/projects', {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        })
        return { success: true, data: response.data.data, status: 'online' }
      } catch (err) {
        if (axios.isAxiosError(err) && !err.response) {
          logger.warn('[git:getMyProjects] Backend unreachable. Falling back to local projects.')
          // Fallback: group all local repositories by projectId for the current developer
          const db = getDb()
          // Get current developerId from session
          const allRepos = db
            .prepare('SELECT * FROM repositories WHERE developerId = ?')
            .all(session.userId)
          // Group by projectId
          const projectsMap = new Map()
          for (const repo of allRepos) {
            if (!repo.projectId) continue
            if (!projectsMap.has(repo.projectId)) {
              projectsMap.set(repo.projectId, { projectId: repo.projectId, repositories: [] })
            }
            projectsMap.get(repo.projectId).repositories.push(repo)
          }
          const localProjects = Array.from(projectsMap.values())
          return { success: true, data: localProjects, status: 'offline' }
        }
        throw err
      }
    } catch (error: any) {
      logger.error(`[git:getMyProjects] ${error.message}`)
      return { success: false, error: error.message }
    }
  })

  // Full update handler (missing in new one)
  ipcMain.handle('git:updateRepoDetails', async (_, data) => {
    try {
      const session = await checkAndRefreshSession()
      // Only send allowed fields in PATCH body
      const patchBody: any = {}
      if (typeof data.name === 'string') patchBody.name = data.name
      if (typeof data.description === 'string') patchBody.description = data.description
      if (typeof data.path === 'string') patchBody.path = data.path
      if (typeof data.status === 'string') patchBody.status = data.status
      // Add developerId if required by backend
      if (session && session.userId) patchBody.developerId = session.userId
      logger.info(
        `[git:updateRepoDetails] PATCH /repositories/${data.repoId} body: ${JSON.stringify(patchBody)}`
      )
      try {
        const response = await backendApi.patch(`/repositories/${data.repoId}`, patchBody, {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        })
        logger.info(`[git:updateRepoDetails] Backend response: ${JSON.stringify(response.data)}`)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          logger.error(
            `[git:updateRepoDetails] Backend error response: ${JSON.stringify(err.response.data)}`
          )
        }
        throw err
      }
      // 2. Update local DB (can still use repoId)
      await GitServices.updateLocalRepository(data)
      return { success: true }
    } catch (error: any) {
      logger.error(`[git:updateRepoDetails] ${error.message}`)
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Update failed.'
        return {
          success: false,
          error: Array.isArray(message) ? message.join(', ') : message
        }
      }
      return { success: false, error: error.message }
    }
  })
}
