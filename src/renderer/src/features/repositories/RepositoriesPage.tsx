import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { RegisterRepoForm } from './RegisterRepoForm'
import { RepoDetailModal } from './RepoDetailModal'
import { SetupRepoModal } from './SetupRepoModal'
import { Repository } from '../../types'
interface RepositoriesPageProps {
  projectId: string | null
  onBack: () => void
}
function RepositoriesPage({ projectId, onBack }: RepositoriesPageProps): React.JSX.Element {
  const gitApi = window.api
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
    return <div className="text-center py-16 text-[var(--c-text-2)]">Loading repositories...</div>
  }

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {projectId && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--c-bg-3)] border border-[var(--c-border-1)] text-[var(--c-text-1)] hover:bg-[var(--c-bg-2)] transition-colors"
                title="Back to all projects"
              >
                <span className="material-icons text-[18px]">arrow_back</span>
                <span className="text-sm font-medium">All Projects</span>
              </button>
            )}

            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--c-text-1)]">{projectId ? 'Repositories for Project' : 'All Repositories'}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncAll}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--c-border-1)] bg-[var(--c-bg-3)] text-[var(--c-text-1)] hover:bg-[var(--c-bg-2)] transition-colors ${isOffline ? 'opacity-60 pointer-events-none' : ''}`}
              disabled={isOffline}
              title={isOffline ? 'Offline: Action disabled' : 'Sync all active repositories'}
            >
              <RefreshCw className="w-4 h-4 text-[var(--c-text-1)]" />
              <span className="text-sm font-medium">Sync All</span>
            </button>

            <button
              onClick={() => setModal('register')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--c-accent-1)] text-white shadow-sm hover:shadow-md transition-all ${isOffline ? 'opacity-60 pointer-events-none' : ''}`}
              disabled={isOffline}
              title={isOffline ? 'Offline: Action disabled' : 'Add a new repository'}
            >
              <span className="material-icons text-[18px]">add</span>
              <span className="text-sm font-semibold">Add Repository</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRepositories.map((repo) => (
            <div
              key={repo.repoId || repo._id}
              className="bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-md p-4 transition-all hover:bg-[var(--c-bg-3)] cursor-pointer"
              onClick={() => handleCardClick(repo)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-[var(--c-text-1)] truncate" title={repo.name}>{repo.name}</h3>
                <p className="text-sm text-[var(--c-text-2)] truncate max-w-[300px] ml-4" title={repo.path}>
                  {repo.path}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    (repo.syncStatus || repo.status) === 'clean'
                      ? 'bg-green-100 text-green-800'
                      : (repo.syncStatus || repo.status) === 'dirty'
                      ? 'bg-yellow-100 text-yellow-800'
                      : (repo.syncStatus || repo.status) === 'error'
                      ? 'bg-red-100 text-red-800'
                      : (repo.syncStatus || repo.status) === 'missing_local'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {repo.syncStatus || repo.status}
                </span>

                {repo.syncStatus === 'missing_local' && (
                  <button
                    className="bg-[var(--c-accent-1)] text-white border-none px-3 py-1 text-sm rounded-md font-semibold cursor-pointer transition-opacity hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(repo)
                    }}
                  >
                    Setup
                  </button>
                )}
              </div>
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
