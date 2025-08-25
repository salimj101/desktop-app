import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

type Repository = {
  repoId?: string
  _id?: string
  repoFingerprint?: string
  path?: string
  name?: string
  description?: string
  status?: string
  totalCommits?: number
  unsyncedCommits?: number
  syncStatus?: string
}

interface RepoDetailModalProps {
  repoId: string
  onClose: () => void
  onUpdate: () => void
  isOffline?: boolean
  initialRepo?: any
}

function RepoDetailModal({ repoId, onClose, onUpdate, isOffline, initialRepo }: RepoDetailModalProps) {
  const { isDark } = useTheme()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // editing flags for inline edit UI
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  // path editing not yet implemented
  const [editableName, setEditableName] = useState('')
  const [editableDescription, setEditableDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchDetails = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.getLocalRepoDetails(repoId)
      if (result && result.success && result.data) {
        setRepo(result.data)
      } else {
        // if no local details, keep repo null and allow UI to show initialRepo fallback
        setRepo(null)
        // don't error-toast here; show fallback UI in modal
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch details.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId])

  useEffect(() => {
    setEditableName(repo?.name || '')
    setEditableDescription(repo?.description || '')
  }, [repo])

  const repoPath = repo?.path || ''

  const handleSync = async (): Promise<void> => {
    if (!repoId) {
      toast.error('Missing repository id')
      return
    }
    if (isOffline) {
      toast.error('Offline: cannot sync')
      return
    }
    setIsProcessing(true)
    try {
      const promise = (window.api as any).syncCommits(repoId)
      await toast.promise(promise, {
        loading: `Syncing ${repo?.name ?? ''}...`,
        success: (res: any) => {
          if (res && res.success) {
            onUpdate()
            fetchDetails()
            return res?.message || 'Sync successful'
          }
          throw new Error(res?.error || 'Unknown error')
        },
        error: (err: any) => `Sync failed: ${err?.message ?? String(err)}`
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtract = async (): Promise<void> => {
    if (!repoId) {
      toast.error('Missing repository id')
      return
    }
    if (isOffline) {
      toast.error('Offline: cannot extract')
      return
    }
    setIsProcessing(true)
    try {
      const promise = (window.api as any).extractCommits(repoId)
      await toast.promise(promise, {
        loading: `Extracting commits for ${repo?.name ?? ''}...`,
        success: (res: any) => {
          if (res && res.success) {
            onUpdate()
            fetchDetails()
            return res?.message || 'Extract complete'
          }
          throw new Error(res?.error || 'Unknown error')
        },
        error: (err: any) => `Extract failed: ${err?.message ?? String(err)}`
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveDetails = async (name: string, description: string): Promise<void> => {
    if (!repoId) {
      toast.error('Missing repository id')
      return
    }
    const payload = { repoId, name, description }
    setIsProcessing(true)
    try {
      const promise = (window.api as any).updateRepoDetails(payload)
      await toast.promise(promise, {
        loading: 'Saving changes...',
        success: (res: any) => {
          if (res && res.success) {
            onUpdate()
            fetchDetails()
            return 'Details updated'
          }
          throw new Error(res?.error || 'Unknown error')
        },
        error: (err: any) => `Update failed: ${err?.message ?? String(err)}`
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Path update handler removed; re-add when wiring UI for path editing

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-3xl rounded-xl shadow-2xl transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading repository...</p>
          </div>
        </div>
      </div>
    )

  if (!repo && !initialRepo)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-3xl rounded-xl shadow-2xl transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300">Repository not found.</p>
          </div>
        </div>
      </div>
    )

  // Render using local repo data when available, otherwise show initialRepo fallback with Setup CTA
  // Path and inline details editing will be implemented later if needed.
  const view = repo ?? initialRepo

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl rounded-xl shadow-2xl transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{view?.name}</h2>
            <button
              onClick={onClose}
              className="ml-4 px-3 py-1 rounded-md border border-transparent text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>

          <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{view?.description || 'No description'}</p>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Sync Status</div>
              <div className="mt-1 font-medium">
                {view?.syncStatus === 'synced' ? 'Synced' : 
                 view?.syncStatus === 'missing_local' ? 'Missing Local' :
                 view?.syncStatus === 'unsynced' ? 'Unsynced' :
                 view?.status || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Commits</div>
              <div className="mt-1 font-medium">{view?.totalCommits ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Unsynced</div>
              <div className={`mt-1 font-medium ${view?.unsyncedCommits && view?.unsyncedCommits > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                {view?.unsyncedCommits ?? 'N/A'}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-gray-500 dark:text-gray-400">Local Path</div>
            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 break-words">{view?.path ?? 'Not available locally'}</div>
          </div>

          <div className="flex items-center space-x-3">
            {repo ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={isOffline || !repoId || isProcessing}
                  className={`px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center space-x-2 ${isOffline || !repoId || isProcessing ? 'pointer-events-none' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{view?.syncStatus === 'synced' ? 'Sync' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={handleExtract}
                  disabled={isOffline || !repoId || isProcessing}
                  className={`px-4 py-2 rounded border text-sm flex items-center space-x-2 ${isOffline || !repoId || isProcessing ? 'opacity-60 pointer-events-none text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Extract Commits</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={async (): Promise<void> => {
                    if (isOffline) {
                      toast.error('Cannot setup while offline')
                      return
                    }
                    if (isProcessing) return
                    setIsProcessing(true)
                    try {
                      const fn = (window.api as any).setupMissingLocalRepo
                      const promise = (async () => {
                        try {
                          return await fn?.(repoId)
                        } catch {
                          return await fn?.({ repoId })
                        }
                      })()
                      await toast.promise(promise, {
                        loading: 'Starting setup...',
                        success: (res: any) => {
                          if (res && res.success) {
                            fetchDetails()
                            onUpdate()
                            return res?.message || 'Setup started'
                          }
                          throw new Error(res?.error || 'Setup failed')
                        },
                        error: (err: any) => `Setup failed: ${err?.message ?? String(err)}`
                      })
                    } finally {
                      setIsProcessing(false)
                    }
                  }}
                  disabled={isOffline || isProcessing}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Setup Local Repo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RepoDetailModal
