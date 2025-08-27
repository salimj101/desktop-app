// src/renderer/src/features/repositories/RegisterRepoForm.tsx
import { useEffect, useState } from 'react'
import { X, Folder, Save } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

interface RegisterRepoFormProps {
  onCancel?: () => void
  onClose?: () => void
  onSuccess?: () => void
  onRepoRegistered?: () => void
  isOffline?: boolean
  defaultProjectId?: string
}

export default function RegisterRepoForm({ onCancel, onClose, onSuccess, onRepoRegistered, isOffline, defaultProjectId }: RegisterRepoFormProps) {
  const { isDark } = useTheme()
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<any[] | null>(null)

  const onCancelHandler = onCancel ?? onClose ?? (() => {})
  const onSuccessHandler = onSuccess ?? onRepoRegistered ?? (() => {})

  const handleBrowse = async () => {
    if (isOffline) {
      toast.error('You are offline — cannot browse for folders.')
      return
    }

    const result = await (window.api as any).selectDirectory?.()
    if (result && result.success && result.path) {
      setPath(result.path)
      
      // Auto-extract folder name from path and set as repository name if empty
      if (!name.trim()) {
        const pathParts = result.path.split(/[/\\]/) // Handle both Unix and Windows paths
        const folderName = pathParts[pathParts.length - 1] || result.path
        setName(folderName)
      }
    } else if (result && result.error) {
      toast.error(result.error)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await (window.api as any).getMyProjects?.()
      // Main process returns { success: true, data: [...] } (not `projects`), normalize here
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.projects) ? res.projects : []
        if (list.length > 0) {
          setProjects(list)
          // Auto-select the first project if none is selected, or use defaultProjectId
          if (!selectedProjectId && list.length > 0) {
            const firstProjectId = list[0]._id || list[0].id || list[0].projectId
            setSelectedProjectId(defaultProjectId || firstProjectId)
          }
        }
      }
    } catch (err) {
      // Ignore errors fetching projects; UI will use fallback/defaults
    }
  }
  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !path.trim() || !selectedProjectId) {
      toast.error('Repository name, path, and project selection are required.')
      return
    }

    // Check if project has reached repository limit
    if (projects) {
      const selectedProject = projects.find(p => 
        (p._id || p.id || p.projectId) === selectedProjectId
      )
      if (selectedProject && selectedProject.repositories && selectedProject.repositories.length >= 10) {
        toast.error('This project has reached its repository limit (10). You cannot add more repositories.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Include a sensible default for permission; backend RegisterRepoInput requires permission
      const payload = {
        name: name.trim(),
        path: path.trim(),
        description: description.trim(),
        projectId: selectedProjectId
      }

      console.log('Sending registration payload:', payload)
      const result = await (window.api as any).registerRepo(payload)

      if (result && result.success) {
        toast.success('Repository registered successfully!')
        onSuccessHandler()
        onCancelHandler()
      } else {
        const errorMessage = result?.error || 'Failed to register repository.'
        console.error('Registration failed:', errorMessage)
        toast.error(`Registration failed: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onCancelHandler}
    >
      <div
        className={`p-8 rounded-xl shadow-2xl w-full max-w-lg mx-4 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Repository</h2>
          <button
            onClick={onCancelHandler}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project-select" className="block text-sm font-medium mb-2">
              Project
            </label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">Select a project</option>
              {projects && projects.map((project) => (
                <option 
                  key={project._id || project.id || project.projectId} 
                  value={project._id || project.id || project.projectId}
                >
                  {project.name}
                </option>
              ))}
            </select>
            <p className={`text-xs mt-1 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Choose which project to add this repository to
            </p>
            {selectedProjectId && projects && (() => {
              const selectedProject = projects.find(p => 
                (p._id || p.id || p.projectId) === selectedProjectId
              )
              if (selectedProject && selectedProject.repositories && selectedProject.repositories.length >= 10) {
                return (
                  <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                    ⚠️ This project has reached its repository limit (10). You cannot add more repositories.
                  </p>
                )
              }
              return null
            })()}
          </div>

          <div>
            <label htmlFor="repo-name" className="block text-sm font-medium mb-2">
              Repository Name
            </label>
            <input
              id="repo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-awesome-project"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500'
              }`}
            />
            <p className={`text-xs mt-1 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Repository name will be auto-filled from the selected folder name
            </p>
          </div>

          <div>
            <label htmlFor="repo-path" className="block text-sm font-medium mb-2">
              Local Path
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="repo-path"
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="e.g., /Users/you/projects/my-awesome-project"
                className={`flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 placeholder-gray-500'
                }`}
              />
              <button
                type="button"
                onClick={handleBrowse}
                disabled={isOffline}
                className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors duration-300 ${
                  isDark
                    ? 'border-gray-600 hover:bg-gray-700'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Folder className="w-5 h-5" />
                <span>Browse</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="repo-desc" className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              id="repo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief description of the repository."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isOffline || (() => {
                if (!selectedProjectId || !projects) return false
                const selectedProject = projects.find(p => 
                  (p._id || p.id || p.projectId) === selectedProjectId
                )
                return selectedProject && selectedProject.repositories && selectedProject.repositories.length >= 10
              })()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? 'Registering...' : 'Register Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
 