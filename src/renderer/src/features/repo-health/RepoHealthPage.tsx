import { ShieldCheck, AlertTriangle, XCircle, GitCompare, RefreshCw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useState, useEffect, useMemo } from 'react'
import { Repository, DashboardStats } from '../../types'
import { toast } from 'react-hot-toast'

export default function RepoHealthPage() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepoHealthData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await (window.api as any).getRepositoriesView()
      if (result.success) {
        setRepositories(result.repositories)
        setStats(result.stats)
      } else {
        throw new Error(result.error || 'Failed to fetch repository health data.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRepoHealthData()
  }, [])

  const handleCheckAllRepos = async () => {
    toast.loading('Checking all repositories...', { id: 'repo-health-check' })
    try {
      const result = await (window.api as any).checkAllRepoHealth()
      if (result.success) {
        toast.success(`Health check complete. Checked ${result.totalChecked} repositories.`, {
          id: 'repo-health-check'
        })
        fetchRepoHealthData() // Refresh data after check
      } else {
        toast.error(result.error || 'Failed to check repository health.', {
          id: 'repo-health-check'
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.'
      toast.error(message, { id: 'repo-health-check' })
    }
  }

  const handleSetupRepo = async (repo: Repository) => {
    toast.loading('Setting up repository...', { id: `setup-${repo._id}` })
    try {
      // 1. Ask user to select a parent directory
      const dirResult = await (window.api as any).selectDirectory()
      if (!dirResult.success) {
        if (dirResult.error !== 'Dialog canceled') {
          toast.error(dirResult.error || 'Could not select directory.', { id: `setup-${repo._id}` })
        } else {
          toast.dismiss(`setup-${repo._id}`)
        }
        return
      }

      // 2. Call backend to clone/setup the repo
      const setupResult = await (window.api as any).setupMissingLocalRepo({
        repoId: repo._id,
        parentPath: dirResult.path
      })

      if (setupResult.success) {
        toast.success(`Repository '${repo.name}' set up successfully.`, { id: `setup-${repo._id}` })
        fetchRepoHealthData() // Refresh the data
      } else {
        toast.error(setupResult.error || 'Failed to set up repository.', {
          id: `setup-${repo._id}`
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.'
      toast.error(message, { id: `setup-${repo._id}` })
    }
  }

  const issues = useMemo(() => {
    return repositories
      .filter((repo) => !repo.health.isHealthy)
      .map((repo) => {
        const problems: string[] = []
        if (repo.health.localPathMissing) problems.push('Repository not found at local path.')
        if (repo.health.gitNotFound) problems.push('Git repository not initialized.')
        if (repo.health.remoteMismatch) problems.push('Remote URL mismatch.')
        if (repo.health.needsPull) problems.push('Local branch is behind remote.')
        if (repo.health.needsPush) problems.push('Local branch is ahead of remote.')
        return { ...repo, problems }
      })
  }, [repositories])

  const healthStats = useMemo(() => {
    const healthy = repositories.filter((r) => r.health.isHealthy).length
    const total = repositories.length
    const issuesCount = total - healthy
    // A simple warning definition could be repos that are healthy but need a push/pull
    const warnings = repositories.filter(
      (r) => r.health.isHealthy && (r.health.needsPull || r.health.needsPush)
    ).length

    return [
      {
        value: healthy,
        label: 'Healthy',
        icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
        color: 'text-green-500'
      },
      {
        value: warnings,
        label: 'Warnings',
        icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
        color: 'text-yellow-500'
      },
      {
        value: issuesCount,
        label: 'Issues',
        icon: <XCircle className="w-8 h-8 text-red-500" />,
        color: 'text-red-500'
      },
      {
        value: total,
        label: 'Total Repos',
        icon: <GitCompare className="w-8 h-8 text-blue-500" />,
        color: 'text-blue-500'
      }
    ]
  }, [repositories])

  return (
    <div
      className={`p-6 h-full transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Repository Health
        </h1>
        <button
          onClick={handleCheckAllRepos}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-300 ${
            isDark
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-check All</span>
        </button>
      </div>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        Monitor and maintain your repository health status
      </p>

      {isLoading ? (
        <div className="text-center py-10">Loading health status...</div>
      ) : error ? (
        <div className="text-center py-10 bg-red-100 text-red-700 p-4 rounded-lg">
          <p>Error: {error}</p>
          <button
            onClick={fetchRepoHealthData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {healthStats.map((stat, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-sm flex items-center space-x-4 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {stat.icon}
                <div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {issues.length === 0 && (
              <div
                className={`lg:col-span-2 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All repositories are healthy!
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No issues found in any of your registered repositories.
                </p>
              </div>
            )}
            {issues.map((issue) => (
              <div
                key={issue._id}
                className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {issue.name}
                    </h3>
                    <p
                      className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {issue.path}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {issue.health.localPathMissing ? 'Missing' : 'Issue'}
                  </span>
                </div>
                <div>
                  <h4
                    className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Issues Found:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {issue.problems.map((problem, i) => (
                      <li key={i} className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {problem}
                      </li>
                    ))}
                  </ul>
                </div>
                {issue.health.localPathMissing && (
                  <button
                    onClick={() => handleSetupRepo(issue)}
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Setup Repository
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
