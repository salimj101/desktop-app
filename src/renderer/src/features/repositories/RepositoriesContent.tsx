import { useState } from 'react'
import { 
  Search,
  Plus,
  RefreshCw,
  Settings,
  GitBranch,
  Calendar
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Repository {
  id: string
  name: string
  path: string
  branches: number
  lastCommit: string
  status: 'missing_local' | 'synced' | 'unsynced'
}

export default function RepositoriesContent() {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: '1',
      name: 'a2sv-project',
      path: 'D:\\Projects\\a2sv-project',
      branches: 3,
      lastCommit: '2 days ago',
      status: 'missing_local'
    },
    {
      id: '2',
      name: 'a2sv-starter--project-g69',
      path: 'E:\\a2sv-starter--project-g69',
      branches: 1,
      lastCommit: '1 week ago',
      status: 'missing_local'
    },
    {
      id: '3',
      name: 'E-commerce-API',
      path: 'D:\\Projects\\E-commerce-API',
      branches: 5,
      lastCommit: '3 days ago',
      status: 'missing_local'
    }
  ])

  const handleSyncAll = async () => {
    // TODO: Implement sync all repositories
    console.log('Sync all repositories clicked')
  }

  const handleAddRepository = () => {
    // TODO: Implement add repository
    console.log('Add repository clicked')
  }

  const handleSetupRepository = (repoId: string) => {
    // TODO: Implement repository setup
    console.log('Setup repository:', repoId)
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.path.toLowerCase().includes(searchQuery.toLowerCase())
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
          {filteredRepositories.map((repo) => (
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
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    repo.status === 'missing_local'
                      ? 'bg-red-100 text-red-800'
                      : repo.status === 'synced'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {repo.status === 'missing_local' ? 'missing_local' :
                     repo.status === 'synced' ? 'synced' : 'unsynced'}
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
          ))}
        </div>
      </main>
    </div>
  )
}
