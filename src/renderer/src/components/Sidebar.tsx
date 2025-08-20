// src/renderer/src/components/Sidebar.tsx
import { useState } from 'react'
import ThemeSwitcher from './ThemeSwitcher'

// --- PROFESSIONAL SVG ICONS ---
// These are now React components for better control and styling.

const TodoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const KanbanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="3" x2="12" y2="21"></line>
    <line x1="8" y1="8" x2="8" y2="16"></line>
    <line x1="16" y1="8" x2="16" y2="12"></line>
  </svg>
)

const RepoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
)

const HealthIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)
const PublicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
)

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)

const ProjectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M3 11h18" />
  </svg>
)

const CommitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <line x1="1.05" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="22.95" y2="12" />
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
    { id: 'projects', label: 'Projects', icon: <ProjectIcon /> },
    { id: 'repositories', label: 'Repositories', icon: <RepoIcon /> },
    { id: 'repohealth', label: 'Repo Health', icon: <HealthIcon /> },
    { id: 'commits', label: 'Commits', icon: <CommitIcon /> },
    { id: 'todo', label: 'Todo', icon: <TodoIcon /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanIcon /> },
    { id: 'public', label: 'Public Boards', icon: <PublicIcon /> }
  ]

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-[250px]'} h-screen bg-[var(--c-bg-2)] flex flex-col justify-between transition-[width] duration-300 ease-in-out border-r border-[var(--c-border-1)]`}>
      <div>
        <div className="flex items-center justify-between p-[15px] border-b border-[var(--c-border-1)]">
          <h1 className="text-2xl font-bold whitespace-nowrap overflow-hidden">
            {isCollapsed ? 'G' : 'GitTracker'}
          </h1>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`bg-none border-none text-[var(--c-text-2)] cursor-pointer p-[5px] flex items-center justify-center rounded-full transition-all duration-300 hover:bg-[var(--c-bg-3)] ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronIcon />
          </button>
        </div>
        <ul className="list-none py-[10px] m-0">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center cursor-pointer whitespace-nowrap overflow-hidden transition-all duration-200 border-r-4 border-transparent
                ${isCollapsed ? 'justify-center px-0 py-3' : 'px-[25px] py-3'}
                ${activePage === item.id 
                  ? 'bg-[var(--c-accent-1)] text-white font-medium border-r-[var(--c-accent-2,var(--c-accent-1))]' 
                  : 'text-[var(--c-text-2)] hover:bg-[var(--c-bg-3)] hover:text-[var(--c-text-1)]'
                }`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <div className={`flex items-center flex-shrink-0 transition-[margin] duration-300 ease-in-out ${isCollapsed ? 'mr-0' : 'mr-5'}`}>
                <div className="w-5 h-5 stroke-2 text-inherit">
                  {item.icon}
                </div>
              </div>
              <span className={`${isCollapsed ? 'hidden' : 'block'}`}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5 flex justify-center border-t border-[var(--c-border-1)]">
        <ThemeSwitcher />
      </div>
    </nav>
  )
}
export default Sidebar
