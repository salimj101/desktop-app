import { useEffect, useState } from 'react'
import { 
  Search,
  Plus,
  RefreshCw,
  Settings,
  GitBranch,
  Calendar
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { RepositoryStatus } from '../../types'
import RegisterRepoForm from './RegisterRepoForm'
import RepoDetailModal from './RepoDetailModal'
import SetupRepoModal from './SetupRepoModal'
import toast from 'react-hot-toast'

export default function RepositoriesPage() {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState<RepositoryStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<RepositoryStatus | null>(null)
  const [setupRepo, setSetupRepo] = useState<RepositoryStatus | null>(null)

  const fetchRepositories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await window.api.getRepositoriesView()
      if (result && result.success) {
        // Ensure repositories is always an array and conforms to RepositoryStatus
        const repos: RepositoryStatus[] = (result.repositories || []).map((repo: any) => ({
          id: repo.repoId ?? repo._id ?? repo.id,
          name: repo.name,
          path: repo.path,
          branches: repo.branches ?? 0,
          lastCommit: repo.lastCommit ?? 'N/A',
          status: repo.status ?? 'unsynced',
          syncStatus: repo.syncStatus || repo.status
        }))
        setRepositories(repos)
        // backend can return a status flag when it's using offline/cache mode
        setIsOffline(result.status === 'offline')
      } else {
        setError(result?.error || 'Failed to fetch repositories.')
        setIsOffline(result?.status === 'offline')
      }
    } catch (err) {
      console.error('Error fetching repositories:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
      // If IPC or network fails, assume offline and show cached UI
      setIsOffline(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  const handleSyncAll = async () => {
    if (isOffline) {
      toast.error('Cannot sync while offline.')
      return
    }
    setActionLoading(true)
    toast.loading('Starting sync for repositories...', { id: 'sync-all' })
    try {
      // Prefer a bulk IPC if the preload exposes it
      const bulk = await (window.api as any).checkAllRepoHealth?.()
      if (bulk && bulk.success) {
        toast.success(bulk.message || 'All repositories checked.', { id: 'sync-all' })
      } else {
        // fallback: iterate and call syncCommits
        const candidates = repositories.filter((r) => !!r.id)
        let ok = 0
        for (const r of candidates) {
          try {
            const res = await window.api.syncCommits(r.id)
            if (res && res.success) ok++
          } catch (e) {
            console.warn('syncCommits failed for', r.id, e)
          }
        }
        toast.success(`Sync complete: ${ok}/${candidates.length} repositories synced.`, {
          id: 'sync-all'
        })
      }
    } catch (err) {
      console.error('Sync all error:', err)
      toast.error('Sync failed: ' + (err instanceof Error ? err.message : String(err)), {
        id: 'sync-all'
      })
    } finally {
      setActionLoading(false)
      fetchRepositories()
    }
  }

  const handleAddRepository = () => {
    setIsRegisterModalOpen(true)
  }

  const handleSetupRepository = (repo: RepositoryStatus) => {
    if (isOffline) {
      toast.error('Cannot setup repository while offline.')
      return
    }
    setSetupRepo(repo)
  }

  const filteredRepositories = repositories.filter(repo =>
    (repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.path && repo.path.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <main className="flex-1 p-6">
        {/* Offline banner */}
        {isOffline && (
          <div className={`p-3 mb-4 text-sm rounded-md ${
            isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
          }`}>
            You are offline — some actions are disabled and cached data is shown.
          </div>
        )}
        {/* Page Title and Actions */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>All Repositories</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your development repositories.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncAll}
              disabled={isOffline || actionLoading}
              style={isOffline || actionLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync All</span>
            </button>
            <button
              onClick={handleAddRepository}
              disabled={isOffline}
              style={isOffline ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Repository</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Repository List */}
        <div className="space-y-4">
            {isLoading ? (
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading repositories...</p>
          ) : error ? (
            <div className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-4 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : filteredRepositories.length > 0 ? (
            filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              onClick={() => setSelectedRepo(repo)}
              className={`p-6 rounded-xl transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-sm`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Repository Name */}
                  <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{repo.name}</h3>
                  
                  {/* Local Path */}
                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {repo.path}
                  </p>
                  
                  {/* Stats */}
                  <div className={`flex items-center space-x-6 text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="flex items-center">
                      <GitBranch className="w-4 h-4 mr-2" />
                      {repo.branches} branches
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Last commit: {repo.lastCommit}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  {/* Status Tag */}
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${(() => {
                      // Show syncStatus first, then fall back to status
                      const displayStatus = repo.syncStatus || repo.status
                      switch (displayStatus) {
                        case 'synced':
                        case 'ok':
                          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        case 'missing_local':
                        case 'missing':
                        case 'deleted':
                          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        case 'unsynced':
                        case 'moved':
                        case 'fingerprint_mismatch':
                        default:
                          return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                      }
                    })()}`}
                  >
                    {(() => {
                      // Show syncStatus first, then fall back to status
                      const displayStatus = repo.syncStatus || repo.status
                      switch (displayStatus) {
                        case 'missing_local':
                          return 'Missing Local'
                        case 'fingerprint_mismatch':
                          return 'Mismatch'
                        default:
                          return displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)
                      }
                    })()}
                  </span>
                  
                  {/* Setup Button - Only show when repository needs setup */}
                  {(repo.syncStatus === 'missing_local' || repo.status === 'missing_local') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetupRepository(repo)
                      }}
                      disabled={isOffline || actionLoading}
                      style={isOffline || actionLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Setup</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>No Repositories Found</h3>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Click 'Add Repository' to get started.
              </p>
            </div>
          )}
        </div>
      </main>
      {isRegisterModalOpen && (
        <RegisterRepoForm
          isOffline={isOffline}
          onCancel={() => setIsRegisterModalOpen(false)}
          onSuccess={() => {
            fetchRepositories() // Refresh the list after a new repo is added
            setIsRegisterModalOpen(false)
          }}
        />
      )}
      {selectedRepo && (
        <RepoDetailModal
          repoId={selectedRepo.id}
          initialRepo={selectedRepo as any}
          onClose={() => setSelectedRepo(null)}
          onUpdate={() => fetchRepositories()}
          isOffline={isOffline}
        />
      )}
      {setupRepo && (
        <SetupRepoModal
          remoteRepo={setupRepo}
          onSuccess={() => {
            fetchRepositories() // Refresh the list after setup
            setSetupRepo(null)
          }}
          onCancel={() => setSetupRepo(null)}
          isOffline={isOffline}
        />
      )}
    </div>
  )
}
