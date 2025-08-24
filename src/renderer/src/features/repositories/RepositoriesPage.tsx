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

export default function RepositoriesPage() {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState<RepositoryStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const fetchRepositories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await window.api.getRepositoriesView()
      if (result && result.success) {
        // Ensure repositories is always an array and conforms to RepositoryStatus
        const repos: RepositoryStatus[] = (result.repositories || []).map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          path: repo.path,
          branches: repo.branches ?? 0,
          lastCommit: repo.lastCommit ?? 'N/A',
          status: repo.status ?? 'unsynced',
        }));
        setRepositories(repos);
      } else {
        setError(result?.error || 'Failed to fetch repositories.')
      }
    } catch (err) {
      console.error('Error fetching repositories:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  const handleSyncAll = async () => {
    // TODO: Implement sync all repositories
    console.log('Sync all repositories clicked')
  }

  const handleAddRepository = () => {
    setIsRegisterModalOpen(true)
  }

  const handleSetupRepository = (repoId: string) => {
    // TODO: Implement repository setup
    console.log('Setup repository:', repoId)
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
            <div key={repo.id} className={`p-6 rounded-xl transition-colors duration-300 ${
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
                      switch (repo.status) {
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
                      switch (repo.status) {
                        case 'missing_local':
                          return 'Missing Local'
                        case 'fingerprint_mismatch':
                          return 'Mismatch'
                        default:
                          return repo.status.charAt(0).toUpperCase() + repo.status.slice(1)
                      }
                    })()}
                  </span>
                  
                  {/* Setup Button */}
                  <button
                    onClick={() => handleSetupRepository(repo.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Setup</span>
                  </button>
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
          onClose={() => setIsRegisterModalOpen(false)}
          onRepoRegistered={() => {
            fetchRepositories() // Refresh the list after a new repo is added
          }}
        />
      )}
    </div>
  )
}
