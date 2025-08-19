// src/renderer/src/pages/ProjectsPage.tsx
import { useState, useEffect } from 'react'
import type { IGitAPI } from '../../../preload/index.d'
import toast from 'react-hot-toast'
import styles from './ProjectsPage.module.css'

// Support both online and offline project shape
interface Project {
  _id?: string
  name?: string
  projectId?: string
  repositories: any[]
}

// The component's props are defined here
interface ProjectsPageProps {
  onProjectSelect: (projectId: string) => void
}

// THE DEFINITIVE FIX: We must accept the props as an argument to the function.
// We destructure { onProjectSelect } directly from the props object.
function ProjectsPage({ onProjectSelect }: ProjectsPageProps): React.JSX.Element {
  const gitApi = window.api as unknown as IGitAPI
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      const result = await gitApi.getMyProjects()
      if (result.success && result.data) {
        setProjects(result.data)
        setIsOffline(result.status === 'offline')
      } else {
        toast.error(result.error || 'Failed to fetch projects.')
        setIsOffline(false)
      }
      setIsLoading(false)
    }
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return <div className={styles.centeredMessage}>Loading projects...</div>

  return (
    <div>
      <div className={styles.header}>
        <h2>Your Projects</h2>
        {isOffline && (
          <span style={{ color: 'var(--c-danger)', marginLeft: 12, fontWeight: 500 }}>
            Offline: Actions disabled
          </span>
        )}
      </div>
      <div className={styles.projectGrid}>
        {projects.map((project) => {
          // Use _id (online) or projectId (offline) as key and click value
          const id = project._id || project.projectId || 'unknown'
          const label = project.name || project.projectId || 'Unnamed Project'
          return (
            <div
              key={id}
              className={styles.projectCard}
              tabIndex={0}
              role="button"
              onClick={() => onProjectSelect(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onProjectSelect(id)
              }}
              style={{ cursor: 'pointer' }}
            >
              <h3>{label}</h3>
              <p>{(project.repositories ?? []).length} repositories</p>
              <span className={styles.viewLink}>View Repositories &rarr;</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectsPage
