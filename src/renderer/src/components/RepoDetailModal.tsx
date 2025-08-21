import { useState } from 'react'
import { Modal } from './Modal'

interface Repository {
  _id: string
  name: string
  description?: string
  path: string
  projectId: string
  projectName?: string
  lastSync?: string
  status: 'active' | 'inactive' | 'error'
}

interface RepoDetailModalProps {
  repository: Repository
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function RepoDetailModal({ 
  repository, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: RepoDetailModalProps): React.JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this repository?')) {
      setIsDeleting(true)
      try {
        await window.api.deleteRepo(repository._id)
        onDelete()
        onClose()
      } catch (error) {
        console.error('Failed to delete repository:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'inactive': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢'
      case 'inactive': return '🟡'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-[var(--c-text-1)]">
            {repository.name}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--c-text-2)] hover:text-[var(--c-text-1)] text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="bg-[var(--c-bg-2)] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[var(--c-text-1)] mb-3">Status</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(repository.status)}</span>
              <span className={`font-medium ${getStatusColor(repository.status)}`}>
                {repository.status.charAt(0).toUpperCase() + repository.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--c-text-1)]">Repository Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--c-text-2)] mb-1">
                  Project
                </label>
                <p className="text-[var(--c-text-1)] font-medium">
                  {repository.projectName || 'Unknown Project'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--c-text-2)] mb-1">
                  Last Sync
                </label>
                <p className="text-[var(--c-text-1)]">
                  {repository.lastSync ? new Date(repository.lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-1">
                Local Path
              </label>
              <p className="text-[var(--c-text-1)] font-mono text-sm bg-[var(--c-bg-2)] p-2 rounded">
                {repository.path}
              </p>
            </div>

            {repository.description && (
              <div>
                <label className="block text-sm font-medium text-[var(--c-text-2)] mb-1">
                  Description
                </label>
                <p className="text-[var(--c-text-1)] bg-[var(--c-bg-2)] p-3 rounded">
                  {repository.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex gap-3 pt-4 border-t border-[var(--c-border-1)]">
            <button
              onClick={onEdit}
              className="flex-1 bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90"
            >
              Edit Repository
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-[var(--c-danger)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Repository'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
