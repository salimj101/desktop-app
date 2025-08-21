import { useState, useEffect } from 'react'
import { Project } from '../../types'
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
  const gitApi = window.api
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      const result = await gitApi.getMyProjects()
      if (result.success && result.data) {
        // result.data may have a lighter shape; cast to Project[] for UI rendering only
        setProjects(result.data as unknown as Project[])
        // Some responses may not include a 'status' field — guard via any cast
        setIsOffline((result as any).status === 'offline')
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
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 sm:mb-12 pb-4 sm:pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--c-text-1)]">Projects</h1>
          <p className="text-[var(--c-text-2)] mt-2 sm:mt-3">Manage and track your development projects</p>
          {isOffline && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[var(--c-bg-3)] text-[var(--c-danger)] text-sm">
              Offline: Actions disabled
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              aria-label="Search projects"
              type="text"
              placeholder="Search projects..."
              className="w-full sm:w-[280px] pl-10 pr-4 py-2 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg text-[var(--c-text-1)] placeholder:text-[var(--c-text-2)] focus:outline-none focus:border-[var(--c-accent-1)]"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg text-[var(--c-text-1)] hover:bg-[var(--c-bg-3)] transition-colors">
            <svg className="w-4 h-4 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span className="text-sm whitespace-nowrap">All Status</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8 mt-6 sm:mt-8">
        {projects.map((project) => {
          const id = project._id || project.projectId || 'unknown'
          const label = project.name || project.projectId || 'Unnamed Project'
          const repoCount = (project.repositories ?? []).length

          return (
            <article
              key={id}
              className="group bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-2xl p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-300 hover:border-[var(--c-accent-1)] hover:shadow-xl hover:-translate-y-1 hover:bg-[var(--c-bg-1)]"
              tabIndex={0}
              role="button"
              onClick={() => onProjectSelect(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onProjectSelect(id)
              }}
            >
              {/* Header with status */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--c-accent-1)] to-[var(--c-accent-2)] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {label.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      repoCount > 0 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${repoCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {repoCount > 0 ? 'Active' : 'On-Hold'}
                    </span>
                  </div>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-[var(--c-bg-3)] rounded-lg text-[var(--c-text-2)] hover:text-[var(--c-text-1)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                  </svg>
                </button>
              </div>

              {/* Project Title */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[var(--c-text-1)] mb-2 group-hover:text-[var(--c-accent-1)] transition-colors">
                  {label}
                </h3>
                <p className="text-[var(--c-text-2)] text-sm leading-relaxed">
                  A development project with {repoCount} {repoCount === 1 ? 'repository' : 'repositories'}
                </p>
              </div>

              {/* Repository Count Card */}
              <div className="bg-[var(--c-bg-3)] rounded-xl p-4 mb-6 border border-[var(--c-border-1)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--c-accent-1)] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--c-text-1)]">{repoCount}</p>
                      <p className="text-xs text-[var(--c-text-2)]">Repositories</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--c-text-1)]">Ready to explore</p>
                    <p className="text-xs text-[var(--c-text-2)]">Click to view</p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-1)]">
                <div className="flex items-center gap-2 text-sm text-[var(--c-text-2)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated recently
                </div>
                
                <div className="flex items-center gap-1 text-[var(--c-accent-1)] font-medium text-sm group-hover:gap-2 transition-all">
                  <span>View Project</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Empty state */}
      {projects.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[var(--c-bg-3)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--c-text-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--c-text-1)] mb-2">No projects found</h3>
          <p className="text-[var(--c-text-2)]">You don't have any projects yet.</p>
        </div>
      )}
    </div>
  )
}
export default ProjectsPage
