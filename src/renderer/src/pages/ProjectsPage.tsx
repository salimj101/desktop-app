// src/renderer/src/pages/ProjectsPage.tsx
import { useState, useEffect } from 'react'
import type { IGitAPI } from '../../../preload/index.d'
import toast from 'react-hot-toast'

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

  if (isLoading) return <div className="text-center py-16 text-[var(--c-text-2)]">Loading projects...</div>

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl">Your Projects</h2>
        {isOffline && (
          <span style={{ color: 'var(--c-danger)', marginLeft: 12, fontWeight: 500 }}>
            Offline: Actions disabled
          </span>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {projects.map((project) => {
          // Use _id (online) or projectId (offline) as key and click value
          const id = project._id || project.projectId || 'unknown'
          const label = project.name || project.projectId || 'Unnamed Project'
          return (
            <div
              key={id}
              className="bg-[var(--c-bg-2)] p-6 rounded-lg border border-[var(--c-border-1)] cursor-pointer transition-colors hover:border-[var(--c-accent-1)]"
              tabIndex={0}
              role="button"
              onClick={() => onProjectSelect(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onProjectSelect(id)
              }}
            >
              <h3 className="mb-2">{label}</h3>
              <p className="text-[var(--c-text-2)] mb-6">{(project.repositories ?? []).length} repositories</p>
              <span className="text-[var(--c-accent-1)] no-underline font-semibold">View Repositories &rarr;</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ProjectsPage
