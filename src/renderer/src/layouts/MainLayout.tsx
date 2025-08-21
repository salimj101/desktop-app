// src/renderer/src/layouts/MainLayout.tsx
import { useState, useRef, useEffect } from 'react'
import { User } from '../types'
import Sidebar from './Sidebar'
import TodoList from '../features/todo/TodoList'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import KanbanPage from '../features/kanban/KanbanPage'
import PublicBoardsPage from '../features/public-boards/PublicBoardsPage'
import ReadOnlyBoardView from '../features/public-boards/ReadOnlyBoardView'
import RepositoriesPage from '../features/repositories/RepositoriesPage'
import ProjectsPage from '../features/projects/ProjectsPage' // Ensure ProjectsPage is imported
import CommitsPage from '../features/commits/CommitsPage' // Import CommitsPage
import RepoHealthPage from '../features/repo-health/RepoHealthPage'

function MainLayout({ user, onLogout }: { user: User; onLogout: () => void }): React.JSX.Element {
  const [activePage, setActivePage] = useState('projects') // Default to Projects
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null)
  const [viewingPublicBoard, setViewingPublicBoard] = useState<number | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (page: string) => {
    setViewingPublicBoard(null)
    setViewingProjectId(null) // Reset project view on main navigation
    setActivePage(page)
  }

  // This function is what we need to pass down
  const handleProjectSelect = (projectId: string) => {
    setViewingProjectId(projectId)
  }

  const renderActivePage = () => {
    if (viewingPublicBoard) {
      return (
        <ReadOnlyBoardView
          boardId={viewingPublicBoard}
          onBack={() => setViewingPublicBoard(null)}
        />
      )
    }

    if (viewingProjectId) {
      // Show the repositories for the selected project
      return (
        <RepositoriesPage projectId={viewingProjectId} onBack={() => setViewingProjectId(null)} />
      )
    }

    switch (activePage) {
      case 'repohealth':
        return <RepoHealthPage />
      // THE DEFINITIVE FIX: We now correctly pass the handleProjectSelect function
      // as the onProjectSelect prop to the ProjectsPage.
      case 'projects':
        return <ProjectsPage onProjectSelect={handleProjectSelect} />

      // This case is for viewing ALL repositories, not tied to a project.
      // We can add a new sidebar link for this later if needed.
      case 'repositories':
        return <RepositoriesPage projectId={null} onBack={() => setActivePage('projects')} />

      case 'todo':
        return <TodoList />

      case 'kanban':
        return <KanbanPage />

      case 'public':
        return <PublicBoardsPage onBoardSelect={(id) => setViewingPublicBoard(id)} />

      case 'commits':
        return <CommitsPage />

      default:
        return <ProjectsPage onProjectSelect={handleProjectSelect} />
    }
  }

  return (
    <div className="flex h-screen w-screen">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className="flex-grow flex flex-col overflow-hidden background-wrapper">
        <div className="content-container">
          <header className="flex justify-between items-center px-8 h-[60px] border-b border-[var(--c-border-1)] bg-[var(--c-bg-2)] flex-shrink-0">
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded-[5px] hover:bg-[var(--c-bg-3)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--c-bg-3)] flex items-center justify-center text-[var(--c-text-1)]">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-[var(--c-border-1)]">
                      <div className="font-medium text-[var(--c-text-1)]">{user.email.split('@')[0]}</div>
                      <div className="text-sm text-[var(--c-text-2)]">{user.email}</div>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false)
                          onLogout()
                        }}
                        className="w-full px-4 py-2 text-left text-[var(--c-danger)] hover:bg-[var(--c-bg-3)] flex items-center gap-2 transition-colors"
                      >
                        <span className="material-icons text-[20px]">logout</span>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="flex-grow py-6 px-8 flex relative flex-col overflow-hidden">{renderActivePage()}</div>
        </div>
      </main>
    </div>
  )
}
export default MainLayout
