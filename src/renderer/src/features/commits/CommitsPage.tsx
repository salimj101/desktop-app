'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Search,
  Folder,
  GitCommit,
  Calendar,
  User,
  FileText,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTheme } from '../../contexts/ThemeContext'

// --- NEW TYPES ---
// These types match the data structure from the getCommits API
interface ApiCommit {
  commitHash: string
  message: string
  author: string
  timestamp: string
  syncedAt: string | null
  branch: string
  // stats JSON contains files_changed, files_added, files_removed, lines_added, lines_removed
  stats: string
  // changes JSON is an array with items: { fileName, added, removed } (or legacy keys additions/deletions)
  changes: string
}

interface ApiRepo {
  repoId: string
  repoName: string
  totalCommits: number
  commits: ApiCommit[]
}

// --- NAVIGATION AND VIEW TYPES ---
type View = 'repositories' | 'commits' | 'commit-detail'

interface NavigationState {
  view: View
  repoId?: string
  repoName?: string
  commitHash?: string
}

// --- COMPONENT ---
export default function CommitsPage() {
  const { isDark } = useTheme()
  const [navigation, setNavigation] = useState<NavigationState>({ view: 'repositories' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [repoCommits, setRepoCommits] = useState<ApiRepo[]>([])

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchCommits = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await (window.api as any).getCommits()
        if (result.success) {
          setRepoCommits(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch commits.')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCommits()
  }, [])

  // --- DERIVED STATE ---
  // These variables find the currently selected repo and commit from the fetched data
  const currentRepository = repoCommits.find((r) => r.repoId === navigation.repoId)
  const currentCommits = currentRepository?.commits || []
  const currentCommitDetail = currentCommits.find((c) => c.commitHash === navigation.commitHash)

  // Helper: consider a commit synced if `syncedAt` exists OR `synced` flag is truthy (covers 1/0)
  const isCommitSynced = (commit: any) => {
    return Boolean(commit.syncedAt) || Boolean(commit.synced)
  }

  // --- FILTERING LOGIC ---
  const filteredRepositories = repoCommits.filter((repo) =>
    repo.repoName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCommits = currentCommits.filter(
    (commit) =>
      commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.commitHash.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- BREADCRUMB RENDER ---
  const renderBreadcrumb = () => {
    const items = ['Projects']
    if (navigation.view === 'commits' || navigation.view === 'commit-detail') {
      items.push('Commits')
    }
    if (navigation.repoName) {
      items.push(navigation.repoName)
    }
    if (navigation.commitHash) {
      items.push(navigation.commitHash)
    }
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span>{'>'}</span>}
            <span>{item}</span>
          </span>
        ))}
      </div>
    )
  }

  // --- REPOSITORIES VIEW ---
  const renderRepositoriesView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {renderBreadcrumb()}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Repository Commits</h1>
          <p className="text-gray-600">View and manage commits across all repositories</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Folder className="w-4 h-4" />
          <span>{repoCommits.length} repositories</span>
        </div>
      </div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              isDark
                ? 'border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>
      <div className="space-y-4">
        {filteredRepositories.map((repo) => (
          <div
            key={repo.repoId}
            className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            onClick={() =>
              setNavigation({ view: 'commits', repoId: repo.repoId, repoName: repo.repoName })
            }
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div
                  className={`${isDark ? 'bg-gray-700' : 'bg-blue-100'} w-8 h-8 rounded flex items-center justify-center`}
                >
                  <Folder className={`w-4 h-4 ${isDark ? 'text-gray-200' : 'text-blue-600'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {repo.repoName}
                  </h3>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {repo.totalCommits} commit(s) found in local database.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <GitCommit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {repo.totalCommits} commits
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {repo.commits.length > 0
                      ? new Date(repo.commits[0].timestamp).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // --- COMMITS LIST VIEW ---
  const renderCommitsView = () => (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {renderBreadcrumb()}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setNavigation({ view: 'repositories' })}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className={`text-2xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentRepository?.repoName}
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Repository commits and history
          </p>
        </div>
        <div
          className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          <GitCommit className={`w-4 h-4 ${isDark ? 'text-gray-300' : ''}`} />
          <span>{currentCommits.length} commits</span>
        </div>
      </div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
          />
          <input
            type="text"
            placeholder="Search commits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              isDark
                ? 'border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>
      <div className="space-y-3">
        {filteredCommits.map((commit) => (
          <div
            key={commit.commitHash}
            className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            onClick={() =>
              setNavigation({
                view: 'commit-detail',
                repoId: navigation.repoId,
                repoName: navigation.repoName,
                commitHash: commit.commitHash
              })
            }
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div
                  className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded text-xs font-mono`}
                >
                  {commit.commitHash.substring(0, 8)}
                </div>
                <span className={`${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                  {commit.message}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {commit.author}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(commit.timestamp).toLocaleString()}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isCommitSynced(commit)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {isCommitSynced(commit) ? 'Synced' : 'Unsynced'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // --- COMMIT DETAIL VIEW ---
  const renderCommitDetailView = () => {
    if (!currentCommitDetail) return null

    const stats = JSON.parse(currentCommitDetail.stats || '{}')
    const changedFiles = JSON.parse(currentCommitDetail.changes || '[]')

    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {renderBreadcrumb()}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() =>
              setNavigation({
                view: 'commits',
                repoId: navigation.repoId,
                repoName: navigation.repoName
              })
            }
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1
              className={`text-2xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {currentCommitDetail.message}
            </h1>
          </div>
        </div>
        <div
          className={`rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Commit Hash
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded text-sm font-mono truncate ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900'}`}
                  >
                    {currentCommitDetail.commitHash}
                  </span>
                </div>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Author
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-900'} text-sm`}>
                    {currentCommitDetail.author}
                  </span>
                </div>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Date
                </label>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-900'} text-sm`}>
                    {new Date(currentCommitDetail.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCommitSynced(currentCommitDetail)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {isCommitSynced(currentCommitDetail) ? 'Synced' : 'Unsynced'}
                  </span>
                </div>
              </div>
              <div>
                <label
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Branch
                </label>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-900'} text-sm mt-1`}>
                  {currentCommitDetail.branch}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-1 text-green-600">
              <Plus className="w-4 h-4" />
              <span className="font-medium">{stats.files_added ?? stats.lines_added ?? 0}</span>
              <span className="text-sm">additions</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <Minus className="w-4 h-4" />
              <span className="font-medium">{stats.files_removed ?? stats.lines_removed ?? 0}</span>
              <span className="text-sm">deletions</span>
            </div>
          </div>
        </div>
        <div
          className={`rounded-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className={`w-4 h-4 ${isDark ? 'text-gray-200' : ''}`} />
            <h2 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
              Files Changed ({changedFiles.length})
            </h2>
          </div>
          <div className="space-y-4">
            {changedFiles.map((file, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b ${isDark ? 'bg-gray-700 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <span
                      className={`${isDark ? 'text-gray-200' : 'text-gray-900'} text-sm font-mono truncate`}
                    >
                      {file.fileName || file.file}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <Plus className="w-3 h-3" />
                        <span>{file.added ?? file.additions ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <Minus className="w-3 h-3" />
                        <span>{file.removed ?? file.deletions ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- MAIN RENDER ---
  if (isLoading) {
    return <div className="p-6">Loading commits...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {navigation.view === 'repositories' && renderRepositoriesView()}
        {navigation.view === 'commits' && renderCommitsView()}
        {navigation.view === 'commit-detail' && renderCommitDetailView()}
      </div>
    </div>
  )
}
