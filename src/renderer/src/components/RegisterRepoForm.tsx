import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Project { _id: string; name: string; }
interface RegisterRepoFormProps { onSuccess: () => void; onCancel: () => void; }

function RegisterRepoForm({ onSuccess, onCancel }: RegisterRepoFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [path, setPath] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // State to prevent double-clicks

  useEffect(() => {
    const fetchProjects = async () => {
      const result = await window.api.getMyProjects()
      if (result.success && result.data) {
        setProjects(result.data)
        setIsOffline(false)
        if (result.data.length > 0) setProjectId(result.data[0]._id)
      } else {
        toast.error('Could not fetch projects. Are you offline?', { id: 'projects-offline' })
        setIsOffline(true)
      }
    }
    fetchProjects()
  }, [])

  const handleBrowse = async () => {
    const result = await window.api.selectDirectory()
    if (result.success && result.path) {
      setPath(result.path)
      const pathParts = result.path.replace(/\\/g, '/').split('/')
      setName(pathParts[pathParts.length - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !path.trim() || !projectId) {
      return toast.error('Name, Path, and Project are all required.')
    }
    
    setIsSubmitting(true);

    const promise = window.api.registerRepo({ name, description, path, projectId })

    toast.promise(promise, {
      loading: 'Validating and registering repository...',
      success: (result) => {
        if (result.success) {
          onSuccess() // This closes the modal and refreshes the list
          return 'Repository registered successfully!' // This becomes the success message
        } else {
          // IMPORTANT: We throw the specific error from the backend
          // This passes control to the 'error' part of the toast
          throw new Error(result.error || 'An unknown error occurred.')
        }
      },
      error: (err) => `Registration failed: ${err.message}` // This displays the exact backend error
    }).finally(() => {
      // Re-enable the submit button whether it succeeded or failed
      setIsSubmitting(false)
    });
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-2">Register a New Repository</h2>
        <p className="text-sm text-[var(--c-text-2)] mb-4">Add a local repository and assign it to a project. Fields marked required must be filled.</p>

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="repoName" className="block text-sm font-medium text-[var(--c-text-1)]">Repository Name</label>
            <input
              id="repoName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-awesome-project"
              className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] border-opacity-60 rounded-md text-[var(--c-text-1)] outline-none focus:ring-1 focus:ring-[var(--c-accent-1)] focus:border-[var(--c-accent-1)] transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="repoDesc" className="block text-sm font-medium text-[var(--c-text-1)]">Description (Optional)</label>
            <textarea
              id="repoDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] border-opacity-60 rounded-md text-[var(--c-text-1)] outline-none focus:ring-1 focus:ring-[var(--c-accent-1)] focus:border-[var(--c-accent-1)] transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="repoPath" className="block text-sm font-medium text-[var(--c-text-1)]">Local Path</label>
            <div className="flex gap-3 items-center">
              <input
                id="repoPath"
                type="text"
                value={path}
                placeholder="Click Browse to select a folder..."
                readOnly
                className="flex-1 p-3 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] border-opacity-60 rounded-md text-[var(--c-text-1)] outline-none"
              />
              <button
                type="button"
                onClick={handleBrowse}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--c-bg-3)] text-[var(--c-text-1)] border border-[var(--c-border-1)] rounded-md hover:bg-[var(--c-bg-2)] transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="project" className="block text-sm font-medium text-[var(--c-text-1)]">Assign to Project</label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isOffline || projects.length === 0}
              className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] border-opacity-60 rounded-md text-[var(--c-text-1)] outline-none focus:ring-1 focus:ring-[var(--c-accent-1)] focus:border-[var(--c-accent-1)] transition-colors disabled:opacity-50"
            >
              {isOffline ? (
                <option>Cannot fetch projects while offline</option>
              ) : projects.length > 0 ? (
                projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)
              ) : (
                <option>No projects found for your account</option>
              )}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border-1)] rounded-md hover:bg-[var(--c-bg-3)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[var(--c-accent-1)] text-white rounded-md hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isOffline || isSubmitting}
          >
            {isSubmitting ? 'Registering…' : 'Register Repository'}
          </button>
        </div>
      </form>
    </div>
  )
}
export default RegisterRepoForm