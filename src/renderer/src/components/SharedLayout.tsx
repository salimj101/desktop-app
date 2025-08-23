import { useState } from 'react'
import { 
  ChevronLeft, 
  Grid3X3, 
  FolderOpen, 
  Link, 
  TrendingUp, 
  GitCommit, 
  CheckSquare, 
  BarChart3, 
  Globe,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigation } from '../contexts/NavigationContext'

interface SharedLayoutProps {
  onLogout: () => void
  children: React.ReactNode
}

export default function SharedLayout({ onLogout, children }: SharedLayoutProps) {
  const { isDark, toggleTheme } = useTheme()
  const { currentPage, setCurrentPage } = useNavigation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigationItems = [
    { icon: Grid3X3, label: 'Dashboard', page: 'dashboard' as const },
    { icon: FolderOpen, label: 'Projects', page: 'projects' as const },
    { icon: Link, label: 'Repositories', page: 'repositories' as const },
    { icon: TrendingUp, label: 'Repo Health', page: 'repoHealth' as const },
    { icon: GitCommit, label: 'Commits', page: 'commits' as const },
    { icon: CheckSquare, label: 'Todo', page: 'todo' as const },
    { icon: BarChart3, label: 'Kanban', page: 'kanban' as const },
    { icon: Globe, label: 'Public Boards', page: 'publicBoards' as const }
  ]

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 shadow-lg ${
        isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
      }`}>
        <div className="p-4">
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`} />
          </button>

          {/* App Name */}
          {!sidebarCollapsed && (
            <h1 className={`text-xl font-bold text-center mt-4 mb-8 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>GitTracker</h1>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-300 ${                                                                                                                                                                                                                                                                       
                  currentPage === item.page 
                    ? 'bg-blue-600 text-white' 
                    : isDark 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`border-b transition-colors duration-300 shadow-sm ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center">
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>GitTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 bg-black text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

