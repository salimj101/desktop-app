import { useState, useEffect } from 'react'
import type { IGitAPI } from '../../../preload/index.d'

type Repository = {
  repoId: string
  _id?: string
  projectId?: string
  repoFingerprint?: string
  path?: string
  name?: string
  description?: string
  status?: string
  syncStatus?: string
  totalCommits?: number
  unsyncedCommits?: number
}
import toast from 'react-hot-toast'
import styles from './RepositoriesPage.module.css'
import Modal from '../components/Modal'
import RegisterRepoForm from '../components/RegisterRepoForm'
import RepoDetailModal from '../components/RepoDetailModal'
import SetupRepoModal from '../components/SetupRepoModal'
interface RepositoriesPageProps {
  projectId: string | null
  onBack: () => void
}
function RepositoriesPage({ projectId, onBack }: RepositoriesPageProps): React.JSX.Element {
  const gitApi = window.api as unknown as IGitAPI
  const [allRepositories, setAllRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [modal, setModal] = useState<'none' | 'register' | 'detail' | 'setup'>('none')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const fetchRepositories = async (): Promise<void> => {
    setIsLoading(true)
    const result = await gitApi.getRepositoriesView()
    if (result.success && result.repositories) {
      setAllRepositories(result.repositories)
      setIsOffline(result.status === 'offline')
    } else {
      toast.error(result.error || 'Failed to fetch repositories.')
      setIsOffline(false)
    }
    setIsLoading(false)
  }
  useEffect(() => {
    fetchRepositories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Filter repositories whenever the projectId prop changes
  useEffect(() => {
    if (projectId) {
      setFilteredRepositories(allRepositories.filter((r) => r.projectId === projectId))
    } else {
      setFilteredRepositories(allRepositories)
    }
  }, [projectId, allRepositories])
  const handleModalClose = (): void => {
    setModal('none')
    setSelectedRepo(null)
  }
  const handleSuccess = (): void => {
    handleModalClose()
    fetchRepositories()
  }

  const handleSyncAll = async (): Promise<void> => {
    toast.loading('Starting sync for all active repos...', { id: 'sync-all' })
    let successCount = 0
    const activeRepos = filteredRepositories.filter(
      (r) => r.status === 'active' || r.syncStatus === 'synced'
    )
    for (const repo of activeRepos) {
      const result = await gitApi.syncCommits(repo.repoId)
      if (result.success) successCount++
    }
    toast.success(`Sync complete! ${successCount}/${activeRepos.length} repositories synced.`, {
      id: 'sync-all'
    })
    fetchRepositories()
  }

  const handleCardClick = async (repo: Repository): Promise<void> => {
    if (repo.syncStatus === 'missing_local') {
      setSelectedRepo(repo)
      setModal('setup')
    } else if (repo.repoId) {
      const result = await gitApi.getLocalRepoDetails(repo.repoId)
      if (result.success) {
        setSelectedRepo(result.data)
        setModal('detail')
      } else {
        toast.error(result.error || 'Could not fetch repository details.')
      }
    } else {
      toast.error('This repository is not fully synced and cannot be viewed.')
    }
  }

  if (isLoading) {
    return <div className={styles.centeredMessage}>Loading repositories...</div>
  }

  return (
    <>
      <div>
        <div className={styles.header}>
          <div>
            {projectId && (
              <button onClick={onBack} className={styles.backButton}>
                ← All Projects
              </button>
            )}
            <h2>{projectId ? 'Repositories for Project' : 'All Repositories'}</h2>
          </div>
          <div>
            <button
              onClick={handleSyncAll}
              className={styles.secondaryAction}
              disabled={isOffline}
              style={isOffline ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              title={isOffline ? 'Offline: Action disabled' : undefined}
            >
              Sync All
            </button>
            <button
              onClick={() => setModal('register')}
              disabled={isOffline}
              style={isOffline ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              title={isOffline ? 'Offline: Action disabled' : undefined}
            >
              + Register New
            </button>
          </div>
        </div>

        <div className={styles.repoList}>
          {filteredRepositories.map((repo) => (
            <div
              key={repo.repoId || repo._id}
              className={styles.repoCard}
              onClick={() => handleCardClick(repo)}
            >
              <div className={styles.repoInfo}>
                <h3 title={repo.name}>{repo.name}</h3>
                <p className={styles.path} title={repo.path}>
                  {repo.path}
                </p>
              </div>
              <span
                className={`${styles.status} ${styles[(repo.syncStatus || repo.status) ?? '']}`}
              >
                {repo.syncStatus || repo.status}
              </span>

              {repo.syncStatus === 'missing_local' && (
                <button
                  className={styles.setupButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCardClick(repo)
                  }}
                >
                  Setup
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Register Modal */}
      <Modal isOpen={modal === 'register'} onClose={handleModalClose}>
        <RegisterRepoForm onSuccess={handleSuccess} onCancel={handleModalClose} />
      </Modal>

      {/* Detail Modal */}
      {selectedRepo && modal === 'detail' && (
        <Modal isOpen onClose={handleModalClose}>
          <RepoDetailModal repo={selectedRepo} onUpdate={handleSuccess} isOffline={isOffline} />
        </Modal>
      )}

      {/* Setup Modal */}
      {selectedRepo && modal === 'setup' && (
        <Modal isOpen onClose={handleModalClose}>
          <SetupRepoModal
            remoteRepo={selectedRepo}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </>
  )
}

export default RepositoriesPage
