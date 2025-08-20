// src/renderer/src/pages/MainLayout.tsx
import { useState } from 'react'
import { User } from '../../../preload/index.d'
import Sidebar from '../components/Sidebar'
import TodoList from '../components/TodoList'
import KanbanPage from './KanbanPage'
import PublicBoardsPage from './PublicBoardsPage'
import ReadOnlyBoardView from './ReadOnlyBoardView'
import RepositoriesPage from './RepositoriesPage'
import ProjectsPage from './ProjectsPage' // Ensure ProjectsPage is imported
import CommitsPage from './CommitsPage' // Import CommitsPage
import RepoHealthPage from './RepoHealthPage'

function MainLayout({ user, onLogout }: { user: User; onLogout: () => void }): React.JSX.Element {
  const [activePage, setActivePage] = useState('projects') // Default to Projects
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null)
  const [viewingPublicBoard, setViewingPublicBoard] = useState<number | null>(null)

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
            <span>
              Logged in as: <strong>{user.email}</strong>
            </span>
            <button onClick={onLogout} className="py-2 px-4 bg-[var(--c-bg-3)] border border-[var(--c-border-1)] rounded-[5px] text-[var(--c-text-1)] cursor-pointer transition-colors hover:bg-[var(--c-danger)] hover:border-[var(--c-danger)] hover:text-white">
              Logout
            </button>
          </header>
          <div className="flex-grow py-6 px-8 flex relative flex-col overflow-hidden">{renderActivePage()}</div>
        </div>
      </main>
    </div>
  )
}
export default MainLayout
