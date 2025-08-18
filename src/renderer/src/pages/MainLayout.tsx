// src/renderer/src/pages/MainLayout.tsx
import { useState } from 'react'
import { User } from '../../../preload/index.d'
import Sidebar from '../components/Sidebar'
import TodoList from '../components/TodoList'
import KanbanPage from './KanbanPage'
import PublicBoardsPage from './PublicBoardsPage'
import ReadOnlyBoardView from './ReadOnlyBoardView'
import RepositoriesPage from './RepositoriesPage' // NEW IMPORT
import styles from './MainLayout.module.css'

function MainLayout({ user, onLogout }: { user: User; onLogout: () => void }): React.JSX.Element {
  const [activePage, setActivePage] = useState('repositories') // Default to new page
  const [viewingPublicBoard, setViewingPublicBoard] = useState<number | null>(null)

  const handleNavigate = (page: string) => {
    setViewingPublicBoard(null)
    setActivePage(page)
  }

  const renderActivePage = () => {
    if (viewingPublicBoard) {
      return <ReadOnlyBoardView boardId={viewingPublicBoard} onBack={() => setViewingPublicBoard(null)} />
    }
    switch (activePage) {
      case 'todo': return <TodoList />
      case 'kanban': return <KanbanPage />
      case 'repositories': return <RepositoriesPage /> // NEW CASE
      case 'public': return <PublicBoardsPage onBoardSelect={(id) => setViewingPublicBoard(id)} />
      default: return <RepositoriesPage /> // NEW DEFAULT
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className={`${styles.content} background-wrapper`}>
        <div className="content-container">
<header className={styles.header}>
          <span>
            Logged in as: <strong>{user.email}</strong>
          </span>
          <button onClick={onLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </header>          <div className={styles.pageContainer}>{renderActivePage()}</div>
        </div>
      </main>
    </div>
  )
}
export default MainLayout