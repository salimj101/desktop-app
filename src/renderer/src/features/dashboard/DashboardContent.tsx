import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Calendar,
  GitBranch,
  GitCommit,
  Link
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Repository {
  id: string
  name: string
  description: string
  status: 'synced' | 'unsynced'
  commits: number
  branches: number
  lastSync: string
}

interface DashboardStats {
  totalRepositories: number
  totalCommits: number
  totalBranches: number
  synced: number
  unsynced: number
}

export default function DashboardContent() {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalRepositories: 0,
    totalCommits: 0,
    totalBranches: 0,
    synced: 0,
    unsynced: 0
  })
  const [repositories, setRepositories] = useState<Repository[]>([
    // will populate from API
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await (window.api as any).getRepositoriesView()
        const payload = res && res.success ? res.data : res

        let repos: any[] = []
        if (Array.isArray(payload)) repos = payload
        else if (payload && Array.isArray(payload.repositories)) repos = payload.repositories
        else if (payload && Array.isArray(payload.repos)) repos = payload.repos
        else if (payload && Array.isArray(payload.data)) repos = payload.data

        const mapped: Repository[] = repos.map((r: any, idx: number) => ({
          id: r.id ?? r.repoId ?? String(idx),
          name: r.name ?? r.repoName ?? r.displayName ?? 'Unknown',
          description: r.description ?? r.desc ?? r.summary ?? '',
          status:
            (r.status as 'synced' | 'unsynced') ??
            (r.synced ? 'synced' : r.isSynced ? 'synced' : 'unsynced'),
          commits: Number(r.commits ?? r.totalCommits ?? r.commitCount ?? 0) || 0,
          branches: Number(r.branches ?? r.totalBranches ?? r.branchCount ?? 0) || 0,
          lastSync: r.lastSync ?? r.syncedAt ?? r.last_synced ?? ''
        }))

        if (!mounted) return

        setRepositories(mapped)

        const totalRepositories = mapped.length
        const totalCommits = mapped.reduce((s, it) => s + (Number(it.commits) || 0), 0)
        const totalBranches = mapped.reduce((s, it) => s + (Number(it.branches) || 0), 0)
        const synced = mapped.filter((it) => it.status === 'synced').length
        const unsynced = totalRepositories - synced

        setStats({ totalRepositories, totalCommits, totalBranches, synced, unsynced })
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load dashboard data')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  const handleRegisterRepo = () => {
    // TODO: Implement repository registration
    console.log('Register repository clicked')
  }

  const handleCheckRepoStatus = () => {
    // TODO: Implement repository status check
    console.log('Check repo status clicked')
  }

  const handleViewDetails = (repoId: string) => {
    // TODO: Navigate to repository details
    console.log('View details for repo:', repoId)
  }

  const handleRefreshRepo = (repoId: string) => {
    // TODO: Refresh repository data
    console.log('Refresh repo:', repoId)
  }

  const handleSyncNow = (repoId: string) => {
    // TODO: Sync repository
    console.log('Sync repo:', repoId)
  }

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className={`max-w-7xl mx-auto p-4 sm:p-6 transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <main className="flex-1">
        {/* Page Title and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Dashboard
            </h1>
            <p
              className={`text-lg transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Overview of your registered repositories and sync status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={handleRegisterRepo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Register Repository</span>
            </button>
            <button
              onClick={handleCheckRepoStatus}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-300 ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Repo Status</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: 'Total Repositories',
              value: stats.totalRepositories,
              subtitle: 'Registered repositories',
              icon: Link,
              color: 'blue'
            },
            {
              label: 'Total Commits',
              value: stats.totalCommits,
              subtitle: 'Across all repositories',
              icon: GitCommit,
              color: 'purple'
            },
            {
              label: 'Total Branches',
              value: stats.totalBranches,
              subtitle: 'Across all repositories',
              icon: GitBranch,
              color: 'indigo'
            },
            {
              label: 'Synced',
              value: stats.synced,
              subtitle: 'Up to date',
              icon: CheckCircle,
              color: 'green'
            },
            {
              label: 'Unsynced',
              value: stats.unsynced,
              subtitle: 'Need attention',
              icon: AlertTriangle,
              color: 'orange'
            }
          ].map((card, index) => (
            <div
              key={index}
              className={`p-4 sm:p-6 rounded-xl transition-colors duration-300 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } shadow-sm`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {card.label}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    card.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : card.color === 'orange'
                        ? 'bg-orange-100 text-orange-600'
                        : card.color === 'blue'
                          ? 'bg-blue-100 text-blue-600'
                          : card.color === 'purple'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
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
          {filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              className={`p-4 sm:p-6 rounded-xl transition-colors duration-300 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3
                      className={`text-xl font-semibold transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {repo.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        repo.status === 'synced'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {repo.status === 'synced' ? (
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Synced
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Unsynced
                        </span>
                      )}
                    </span>
                  </div>
                  <p
                    className={`mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {repo.description}
                  </p>
                  <div
                    className={`flex flex-wrap items-center gap-4 text-sm transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <span className="flex items-center">
                      <GitCommit className="w-4 h-4 mr-2" />
                      {repo.commits} commits
                    </span>
                    <span className="flex items-center">
                      <GitBranch className="w-4 h-4 mr-2" />
                      {repo.branches} branches
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Last sync: {repo.lastSync}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-0 sm:ml-4 w-full sm:w-auto">
                  <button
                    onClick={() => handleViewDetails(repo.id)}
                    className={`w-full sm:w-auto px-4 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    View Details
                  </button>
                  {repo.status === 'synced' ? (
                    <button
                      onClick={() => handleRefreshRepo(repo.id)}
                      className={`w-full sm:w-auto px-4 py-2 border rounded-lg transition-colors duration-300 ${
                        isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Refresh
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSyncNow(repo.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
