import { useState } from 'react'
import { X, Folder, Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

interface SetupRepoModalProps {
  remoteRepo: any
  onSuccess?: () => void
  onCancel?: () => void
  onClose?: () => void
  isOffline?: boolean
}

export default function SetupRepoModal({ 
  remoteRepo, 
  onSuccess, 
  onCancel, 
  onClose, 
  isOffline 
}: SetupRepoModalProps) {
  const { isDark } = useTheme()
  const [path, setPath] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onCancelHandler = onCancel ?? onClose ?? (() => {})
  const onSuccessHandler = onSuccess ?? (() => {})

  const handleBrowse = async () => {
    if (isOffline) {
      toast.error('You are offline — cannot browse for folders.')
      return
    }

    const result = await (window.api as any).selectDirectory?.()
    if (result && result.success && result.path) {
      setPath(result.path)
    } else if (result && result.error) {
      toast.error(result.error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!path.trim()) {
      toast.error("Please select the local path for this repository.")
      return
    }

    setIsSubmitting(true)
    try {
      // The remoteRepo object from getRepositoriesView now has the fingerprint
      const promise = (window.api as any).setupMissingLocalRepo({ 
        remoteRepo: { ...remoteRepo, path }, 
        localPath: path 
      })

      await toast.promise(promise, {
        loading: 'Validating and setting up repository...',
        success: (result: any) => {
          if (result.success) { 
            onSuccessHandler()
            return "Repository setup complete!" 
          }
          throw new Error(result.error)
        },
        error: (err: any) => `Setup failed: ${err.message}`
      })
    } catch (error) {
      console.error('Setup submission error:', error)
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get status information
  const getStatusInfo = () => {
    const status = remoteRepo.syncStatus || remoteRepo.status
    if (status === 'missing_local') {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        text: 'Repository is missing locally',
        description: 'This repository exists on the server but is not available on your local machine.',
        color: 'text-red-600'
      }
    }
    if (status === 'synced') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: 'Repository is synced',
        description: 'This repository is properly set up and synchronized.',
        color: 'text-green-600'
      }
    }
    return {
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      text: 'Repository needs attention',
      description: 'This repository may need setup or synchronization.',
      color: 'text-orange-600'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-xl shadow-2xl transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Setup Local Repository
            </h2>
            {statusInfo.icon}
          </div>
          <button
            onClick={onCancelHandler}
            className={`p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Status Information */}
          <div className={`mb-6 p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-start space-x-3">
              {statusInfo.icon}
              <div>
                <h3 className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </h3>
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          <p className={`text-sm mb-6 transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Please locate the local folder for <strong className="text-blue-600 dark:text-blue-400">{remoteRepo.name}</strong>.
          </p>

          <div className="space-y-4">
            {/* Path Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Local Path
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={path}
                  placeholder="Click Browse to select..."
                  readOnly
                  className={`flex-1 px-3 py-2 border rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleBrowse}
                  disabled={isOffline}
                  className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${
                    isOffline
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancelHandler}
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!path.trim() || isSubmitting || isOffline}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 ${
                !path.trim() || isSubmitting || isOffline
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Validate & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
