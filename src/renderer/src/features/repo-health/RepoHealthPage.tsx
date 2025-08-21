import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../../components/Modal'
import { SetupRepoModal } from '../repositories/SetupRepoModal'
import { Repository } from '../../types/index'

function RepoHealthPage(): JSX.Element {
  const gitApi = window.api
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
    <div className="p-8">
      <div className="flex items-center gap-6 mb-8">
        <h2>Repository Health</h2>
        <button
          onClick={handleCheckAll}
          disabled={isOffline}
          className="bg-[var(--c-primary)] text-white border-none py-2 px-6 rounded font-semibold cursor-pointer ml-auto transition-colors disabled:bg-[#aaa] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Check All
        </button>
        {isOffline && (
          <span className="text-[var(--c-danger)] font-medium ml-4">
            Offline: Health check disabled
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-6">
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
                className="bg-[var(--c-bg-2)] border-2 border-dashed border-[var(--c-warning)] text-[var(--c-text-1)] shadow-[0_2px_8px_rgba(0,0,0,0.07)] cursor-default opacity-100 relative mb-3 rounded-[10px] p-[1.7rem_1.3rem_1.3rem_1.3rem] min-w-[270px] max-w-[350px] flex-[1_1_270px] flex flex-col gap-[0.7rem] transition-[box-shadow_0.18s,border_0.18s] hover:shadow-[0_4px_18px_rgba(0,0,0,0.13)] hover:border-[var(--c-primary)]"
              >
                <div className="mb-2">
                  <h3 title={repo.name} className="text-[var(--c-text-1)]">
                    {repo.name}
                  </h3>
                  <p className="text-[#888] text-[0.95em] mb-1" title={repo.path}>
                    {repo.path}
                  </p>
                </div>
                <span className="inline-block py-[0.18em] px-[0.85em] rounded-xl text-[0.97em] font-semibold tracking-[0.01em] mt-1 mb-1 ml-auto text-[var(--c-warning)] bg-[#fffbe6] border border-[var(--c-warning)]">
                  <span className="font-semibold">Missing Local</span>
                </span>
                <div className="text-[var(--c-warning)] text-[13px] mt-1 mb-2">
                  {healthMsg || 'This repository is missing locally. You can set it up below.'}
                </div>
                {!isOffline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetupMissing(repo)
                    }}
                    className="bg-gradient-to-r from-[#f7971e] to-[#ffd200] text-[#222] border-none rounded-md py-[0.45rem] px-[1.3rem] font-semibold text-base shadow-[0_2px_8px_rgba(241,196,15,0.08)] cursor-pointer transition-all mt-[0.2rem] hover:bg-gradient-to-r hover:from-[#ffd200] hover:to-[#f7971e] hover:shadow-[0_4px_16px_rgba(241,196,15,0.13)] hover:transform hover:-translate-y-[2px] hover:scale-[1.03]"
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
              className="bg-[var(--c-bg-2)] border border-[var(--c-border-1)] text-[var(--c-text-1)] shadow-[0_2px_8px_rgba(0,0,0,0.07)] cursor-default opacity-100 rounded-[10px] p-[1.7rem_1.3rem_1.3rem_1.3rem] min-w-[270px] max-w-[350px] flex-[1_1_270px] flex flex-col gap-[0.7rem] relative transition-[box-shadow_0.18s,border_0.18s] hover:shadow-[0_4px_18px_rgba(0,0,0,0.13)] hover:border-[var(--c-primary)]"
            >
              <div className="mb-2">
                <h3 title={repo.name} className="text-[var(--c-text-1)]">
                  {repo.name}
                </h3>
                <p className="text-[#888] text-[0.95em] mb-1" title={repo.path}>
                  {repo.path}
                </p>
              </div>
              <span
                className={`inline-block py-[0.18em] px-[0.85em] rounded-xl text-[0.97em] font-semibold tracking-[0.01em] mt-1 mb-1 ml-auto ${
                  status === 'active'
                    ? 'text-[var(--c-success)] bg-[#e8f7e2] border border-[var(--c-success)]'
                    : status === 'missing_local'
                      ? 'text-[var(--c-warning)] bg-[#fffbe6] border border-[var(--c-warning)]'
                      : status === 'moved'
                        ? 'text-[#b36f00] bg-[#fff3e0] border border-[#b36f00]'
                        : status === 'deleted'
                          ? 'text-[var(--c-danger)] bg-[#ffeaea] border border-[var(--c-danger)]'
                          : status === 'error'
                            ? 'text-white bg-[var(--c-danger)] border border-[var(--c-danger)]'
                            : 'bg-[#f5f5f5]'
                }`}
              >
                {status}
              </span>
              {healthMsg && (
                <div className="text-[var(--c-warning)] text-[13px] mt-1">{healthMsg}</div>
              )}
              <div className="flex gap-2 mt-2">
                {!isOffline && repo.status === 'deleted' && (
                  <button
                    onClick={() => handleFixPath(repo)}
                    className="bg-[var(--c-accent)] text-white border-none rounded py-[0.4rem] px-[1.2rem] font-medium cursor-pointer mt-2 transition-colors hover:bg-[var(--c-primary)]"
                  >
                    Update Path
                  </button>
                )}
                {!isOffline && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await handleSyncRepoStatus(repo)
                    }}
                    className="bg-gradient-to-r from-[#4f8cff] to-[#2356c7] text-white border-none rounded-md py-[0.45rem] px-[1.3rem] font-semibold text-base shadow-[0_2px_8px_rgba(79,140,255,0.08)] cursor-pointer transition-all mt-[0.2rem] hover:bg-gradient-to-r hover:from-[#2356c7] hover:to-[#4f8cff] hover:shadow-[0_4px_16px_rgba(79,140,255,0.13)] hover:transform hover:-translate-y-[2px] hover:scale-[1.03]"
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
