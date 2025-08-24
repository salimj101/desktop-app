import { useNavigation } from '../contexts/NavigationContext'
import { useTheme } from '../contexts/ThemeContext'
import SharedLayout from './SharedLayout'
import DashboardPage from '../features/dashboard/DashboardPage'
import RepositoriesPage from '../features/repositories/RepositoriesPage'
import RepoHealthPage from '../features/repo-health/RepoHealthPage'
import ProjectsPage from '@renderer/features/projects/ProjectsPage'
import KanbanBoard from '@renderer/features/kanban/KanbanBoard'

interface MainContentProps {
  onLogout: () => void
}

export default function MainContent({ onLogout }: MainContentProps) {
  const { currentPage } = useNavigation()
  const { isDark } = useTheme()

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'repositories':
        return <RepositoriesPage />
      case 'repoHealth':
        return <RepoHealthPage />
      case 'projects':
        return <ProjectsPage />
      case 'kanban':
        return <KanbanBoard />
      case 'commits':
      case 'todo':
      case 'publicBoards':
        // TODO: Implement other pages
        return (
          <div className={`min-h-screen transition-colors duration-300 ${
            isDark ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <div className="p-6">
              <div className="text-center">
                <h1 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
                <p className={`transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>This page is coming soon!</p>
              </div>
            </div>
          </div>
        )
      default:
        return <DashboardPage />
    }
  }

  return (
    <SharedLayout onLogout={onLogout}>
      {renderPageContent()}
    </SharedLayout>
  )
}
