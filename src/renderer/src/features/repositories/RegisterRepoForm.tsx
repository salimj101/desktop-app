// src/renderer/src/features/repositories/RegisterRepoForm.tsx
import { useState } from 'react'
import { X, Folder, Save } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

interface RegisterRepoFormProps {
  onClose: () => void
  onRepoRegistered: () => void
}

export default function RegisterRepoForm({ onClose, onRepoRegistered }: RegisterRepoFormProps) {
  const { isDark } = useTheme()
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBrowse = async () => {
    const result = await window.api.selectDirectory()
    if (result.success && result.path) {
      setPath(result.path)
      if (!name) {
        setName(result.name || '')
      }
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !path.trim()) {
      toast.error('Repository name and path are required.')
      return
    }
    setIsSubmitting(true)
    try {
      // TODO: Replace with dynamic project ID once project management is implemented
      const hardcodedProjectId = 'project-123'

      const result = await window.api.registerRepo({
        name: name.trim(),
        path: path.trim(),
        description: description.trim(),
        projectId: hardcodedProjectId
      })

      if (result.success) {
        toast.success('Repository registered successfully!')
        onRepoRegistered()
        onClose()
      } else {
        const errorMessage = result.error || 'Failed to register repository.'
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
      onClick={onClose}
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
            onClick={onClose}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isSubmitting}
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

// index.d.ts
interface IGitAPI {
  // ... existing methods ...
  syncRepoStatus: (repoId: string) => Promise<{
    success: boolean
    repoId?: string
    localStatus?: string
    remoteStatus?: string
    remoteResult?: { ok: boolean; error?: string } | null
    error?: string
  }>
  selectDirectory: () => Promise<{
    success: boolean
    path?: string
    name?: string
    error?: string
  }>
}

declare global {
  // ... existing code ...
}
