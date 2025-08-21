import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface RegisterRepoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

type Project = { projectId: string; name: string }

export function RegisterRepoForm({
  onSuccess,
  onCancel
}: RegisterRepoFormProps): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    path: ''
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await window.api.getMyProjects()
        if (res.success && res.data) {
          setProjects(res.data as any)
          if (res.data.length === 1) {
            setProjectId(res.data[0].projectId)
          }
        }
      } catch (e) {
        // non-blocking
      }
    }
    loadProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) {
      toast.error('Please select a project')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await window.api.registerRepo({
        name: formData.name,
        description: formData.description,
        path: formData.path,
        projectId
      })
      if (result.success) {
        toast.success('Repository registered')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to register repository')
      }
    } catch (err) {
      toast.error('Unexpected error while registering repository')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Register Repository</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="repoName"
            className="block text-sm font-medium text-[var(--c-text-2)] mb-2"
          >
            Repository Name *
          </label>
          <input
            id="repoName"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)]"
            placeholder="Enter repository name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="repoPath"
            className="block text-sm font-medium text-[var(--c-text-2)] mb-2"
          >
            Local Path *
          </label>
          <input
            id="repoPath"
            type="text"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)]"
            placeholder="Enter local repository path"
            required
          />
        </div>

        <div>
          <label
            htmlFor="project"
            className="block text-sm font-medium text-[var(--c-text-2)] mb-2"
          >
            Project *
          </label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)]"
            required
          >
            <option value="" disabled>
              {projects.length ? 'Select a project' : 'Loading projects...'}
            </option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="repoDescription"
            className="block text-sm font-medium text-[var(--c-text-2)] mb-2"
          >
            Description (optional)
          </label>
          <textarea
            id="repoDescription"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)] resize-none"
            placeholder="Enter repository description"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[var(--c-bg-3)] text-[var(--c-text-2)] border-none py-2 px-4 rounded font-medium cursor-pointer hover:bg-[var(--c-bg-4)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
