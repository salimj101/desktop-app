// src/renderer/src/components/Sidebar.tsx
import { useState } from 'react'
import styles from './Sidebar.module.css'
import ThemeSwitcher from './ThemeSwitcher'

// --- PROFESSIONAL SVG ICONS ---
// These are now React components for better control and styling.

const TodoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const KanbanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="3" x2="12" y2="21"></line>
    <line x1="8" y1="8" x2="8" y2="16"></line>
    <line x1="16" y1="8" x2="16" y2="12"></line>
  </svg>
)

const RepoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
)

const PublicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
)

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)


interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

function Sidebar({ activePage, onNavigate }: SidebarProps): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // The navItems array now uses the icon components directly
  const navItems = [
    { id: 'todo', label: 'Todo', icon: <TodoIcon /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanIcon /> },
    { id: 'repositories', label: 'Repositories', icon: <RepoIcon /> },
    { id: 'public', label: 'Public Boards', icon: <PublicIcon /> }
  ]

  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div>
        <div className={styles.topSection}>
          <h1 className={styles.logo}>{isCollapsed ? 'G' : 'GitTracker'}</h1>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={styles.collapseBtn}>
            <ChevronIcon />
          </button>
        </div>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <div className={styles.icon}>{item.icon}</div>
              <span className={styles.label}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bottomSection}>
        <ThemeSwitcher />
      </div>
    </nav>
  )
}
export default Sidebar