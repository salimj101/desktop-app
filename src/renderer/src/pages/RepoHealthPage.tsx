import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import styles from './RepositoriesPage.module.css'
import Modal from '../components/Modal'
import SetupRepoModal from '../components/SetupRepoModal'
import type { IGitAPI } from '../../../preload/index.d'

interface Repository {
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

function RepoHealthPage(): JSX.Element {
  const gitApi = window.api as unknown as IGitAPI
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true) // Unused
  const [isOffline, setIsOffline] = useState(false)
  const [modalRepo, setModalRepo] = useState<Repository | null>(null)
  const [modalType, setModalType] = useState<'setup' | 'path' | null>(null)

  const fetchRepositories = async (): Promise<void> => {
    setIsLoading(true)
    const result = await gitApi.getRepositoriesView()
    if (result.success && result.repositories) {
      setRepositories(result.repositories)
      setIsOffline(result.status === 'offline')
    } else if (result.status === 'offline' && result.repositories) {
      setRepositories(result.repositories)
      setIsOffline(true)
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

  const handleCheckAll = async (): Promise<void> => {
    if (isOffline) return
    toast.loading('Checking all repositories...', { id: 'health-check' })
    const result = await gitApi.checkAllRepoHealth?.()
    if (result && result.success && Array.isArray(result.data)) {
      setRepositories((prevRepos) => {
        return prevRepos.map((repo) => {
          const health = result.data?.find(
            (r: { repoId: string; status: string; message: string }) => r.repoId === repo.repoId
          )
          if (health) {
            return { ...repo, status: health.status, healthMessage: health.message }
          }
          return repo
        })
      })
      toast.success('Health check complete!', { id: 'health-check' })
    } else {
      toast.error(result?.error || 'Failed to check repositories.', { id: 'health-check' })
    }
  }

  const handleSyncRepoStatus = async (repo: Repository): Promise<void> => {
    toast.loading(`Syncing status for ${repo.name || repo.repoId}...`, {
      id: `sync-${repo.repoId}`
    })
    const result = await gitApi.syncRepoStatus?.(repo.repoId)
    if (result && result.success) {
      toast.success(`Synced status: ${result.remoteStatus}`, { id: `sync-${repo.repoId}` })
      fetchRepositories()
    } else {
      toast.error(result?.error || 'Failed to sync status.', { id: `sync-${repo.repoId}` })
    }
  }

  const handleFixPath = (repo: Repository): void => {
    setModalRepo(repo)
    setModalType('path')
  }

  const handleSetupMissing = (repo: Repository): void => {
    setModalRepo(repo)
    setModalType('setup')
  }

  const handleModalClose = (): void => {
    setModalRepo(null)
    setModalType(null)
    fetchRepositories()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Repository Health</h2>
        <button onClick={handleCheckAll} disabled={isOffline} className={styles.checkAllBtn}>
          Check All
        </button>
        {isOffline && <span className={styles.offlineWarning}>Offline: Health check disabled</span>}
      </div>
      <div className={styles.repoList}>
        {repositories.map((repo) => {
          // Only show 'missing_local' for repos missing from SQLite (syncStatus === 'missing_local')
          const status =
            repo.syncStatus === 'missing_local' ? 'missing_local' : repo.status || 'unknown'
          const isMissingLocal = repo.syncStatus === 'missing_local'
          const healthMsg = (repo as { healthMessage?: string }).healthMessage
          if (isMissingLocal) {
            return (
              <div
                key={repo.repoId || repo._id}
                className={styles.repoCard}
                style={{
                  backgroundColor: 'var(--c-bg-2)',
                  border: '2px dashed var(--c-warning)',
                  color: 'var(--c-text-1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  cursor: 'default',
                  opacity: 1,
                  position: 'relative',
                  marginBottom: 12
                }}
              >
                <div className={styles.repoInfo}>
                  <h3 title={repo.name} style={{ color: 'var(--c-text-1)' }}>
                    {repo.name}
                  </h3>
                  <p className={styles.path} title={repo.path} style={{ color: 'var(--c-text-2)' }}>
                    {repo.path}
                  </p>
                </div>
                <span
                  className={`${styles.status} ${styles[status]}`}
                  style={{ marginLeft: 'auto', color: 'var(--c-warning)' }}
                >
                  <span style={{ fontWeight: 600 }}>Missing Local</span>
                </span>
                <div
                  style={{ color: 'var(--c-warning)', fontSize: 13, marginTop: 4, marginBottom: 8 }}
                >
                  {healthMsg || 'This repository is missing locally. You can set it up below.'}
                </div>
                {!isOffline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetupMissing(repo)
                    }}
                    className={styles.setupBtn}
                  >
                    Setup
                  </button>
                )}
              </div>
            )
          }
          // Normal card
          return (
            <div
              key={repo.repoId || repo._id}
              className={styles.repoCard}
              style={{
                backgroundColor: 'var(--c-bg-2)',
                border: '1px solid var(--c-border-1)',
                color: 'var(--c-text-1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                cursor: 'default',
                opacity: 1
              }}
            >
              <div className={styles.repoInfo}>
                <h3 title={repo.name} style={{ color: 'var(--c-text-1)' }}>
                  {repo.name}
                </h3>
                <p className={styles.path} title={repo.path} style={{ color: 'var(--c-text-2)' }}>
                  {repo.path}
                </p>
              </div>
              <span className={`${styles.status} ${styles[status]}`} style={{ marginLeft: 'auto' }}>
                {status}
              </span>
              {healthMsg && (
                <div style={{ color: 'var(--c-warning)', fontSize: 13, marginTop: 4 }}>
                  {healthMsg}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {!isOffline && repo.status === 'deleted' && (
                  <button onClick={() => handleFixPath(repo)} className={styles.secondaryAction}>
                    Update Path
                  </button>
                )}
                {!isOffline && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await handleSyncRepoStatus(repo)
                    }}
                    className={styles.syncBtn}
                  >
                    Sync Status
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* SetupRepoModal for missing_local */}
      {modalType === 'setup' && modalRepo && (
        <Modal isOpen={true} onClose={handleModalClose}>
          <SetupRepoModal
            remoteRepo={modalRepo}
            onSuccess={handleModalClose}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  )
}

export default RepoHealthPage
