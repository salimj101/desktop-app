// src/main/ipcHandlers/git.handlers.ts
import { dialog, ipcMain } from 'electron'
import { checkAndRefreshSession } from '../lib/auth.service'
import GitServices from '../lib/git.service'
import axios from 'axios'
import logger from '../lib/logger'
import { getDb } from '../lib/database'

// Use an environment variable for the backend URL
const backendApi = axios.create({ baseURL: 'http://localhost:3001/api' });

export function registerGitHandlers() {
  // Equivalent to POST /register-repo
  ipcMain.handle('git:selectDirectory', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, path: result.filePaths[0] }
      }
      return { success: false, error: 'No directory selected.' }
    } catch (error) {
      logger.error(`[git:selectDirectory] ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('git:registerRepo', async (_, data: { name, description, path, projectId }) => {
    try {
      const session = await checkAndRefreshSession();
      const repoFingerprint = await GitServices.validateLocalRepository(data.path);
      
      const payload = { ...data, developerId: session.userId, repoFingerprint };
            console.log('Sending payload to /repositories/register:', payload);

      const response = await backendApi.post('/repositories/register', payload, {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      });

      const db = getDb();
      const repoData = response.data.data;
      db.prepare(`INSERT INTO repositories (repoId, name, description, path, developerId, projectId, permission, repoFingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        repoData._id, repoData.name, repoData.description, repoData.path, 
        repoData.developerId, repoData.projectId, repoData.permission, repoData.repoFingerprint
      );
      
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error(`[git:registerRepo] ${error.response.data.message}`);
      return { success: false, error: error.message };
    }
  });

  // Equivalent to GET /extract-new-commits/:repoId
  ipcMain.handle('git:extractCommits', async (_, repoId: string) => {
    try {
      const session = await checkAndRefreshSession();
      const newCommits = await GitServices.extractNewCommits(repoId, session.userId);
      return { success: true, data: newCommits };
    } catch (error: any) {
      logger.error(`[git:extractCommits] ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Equivalent to GET /get-repo (FetchRepositoryController) with offline fallback
  ipcMain.handle('git:getRepositoriesView', async () => {
    let session;
    try {
      session = await checkAndRefreshSession();
      const response = await backendApi.get('/repositories/me/developer', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const remoteRepos = response.data.data.repositories;
      const compareRes = await GitServices.compareRepositories(session.userId, remoteRepos);
      const consolidatedView = await GitServices.getConsolidatedRepositoryView(session.userId, compareRes);
      return { success: true, ...consolidatedView };
    } catch (error: any) {
      if (axios.isAxiosError(error) && !error.response && session) {
        logger.warn('[git:getRepositoriesView] Backend unreachable. Falling back to local data.');
        const localRepos = await GitServices.getAllLocalRepositories(session.userId);
        const annotated = localRepos.map(repo => ({ ...repo, syncStatus: 'offline' }));
        return { success: true, status: 'offline', repositories: annotated };
      }
      logger.error(`[git:getRepositoriesView] ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Equivalent to POST /sync-unsynced-commits/:repoId
  ipcMain.handle('git:syncCommits', async (_, repoId: string) => {
    try {
      const session = await checkAndRefreshSession();
      const unsyncedCommits = await GitServices.getUnsyncedCommits(repoId, session.userId);
      if (unsyncedCommits.length === 0) {
        return { success: true, message: 'Already in sync.' };
      }
      
      const payload = unsyncedCommits.map((c: any) => ({
        // ... transformation logic ...
      }));

      const response = await backendApi.post('/git-data/commits', payload, {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      });
      
      await GitServices.markCommitsAsSynced(repoId, session.userId);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error(`[git:syncCommits] ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Handler to get projects for dropdowns
  ipcMain.handle('git:getMyProjects', async () => {
    try {
      const session = await checkAndRefreshSession();
      const response = await backendApi.get('/users/developers/me/projects', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      logger.error(`[git:getMyProjects] ${error.message}`);
      return { success: false, error: error.message };
    }
  });
}