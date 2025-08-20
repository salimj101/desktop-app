// src/renderer/src/components/RepoDetailModal.tsx
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
// Ensure the correct type is imported or replace with a placeholder type
// Define a local type if 'Repository' is not exported from the module
type Repository = {
  repoId: string
  _id?: string
  repoFingerprint?: string
  path?: string
  name?: string
  description?: string
  status?: string
  totalCommits?: number
  unsyncedCommits?: number
}

// It's better to type the repo prop more specifically if possible
interface RepoDetailModalProps {
  repo: Repository & { totalCommits?: number; unsyncedCommits?: number } // Allow optional commit counts
  onUpdate: () => void
  isOffline?: boolean
}

function RepoDetailModal({ repo, onUpdate, isOffline }: RepoDetailModalProps): React.JSX.Element {
  // Extract commits handler (now correctly inside component)
  const handleExtractCommits = async () => {
    if (!repoId) {
      toast.error('Cannot extract: Missing repository ID.')
      return
    }
    const promise = window.api.extractCommits(repoId)
    toast.promise(promise, {
      loading: `Extracting commits for ${repo.name ?? ''}...`,
      success: (result) => {
        if (result && result.success && Array.isArray(result.data) && result.data.length === 0) {
          return `${repo.name ?? ''} is already up to date.`
        }
        if (result && result.success) {
          onUpdate()
          return (result as any).message || 'Commits extracted successfully!'
        }
        throw new Error(result?.error || 'Unknown error')
      },
      error: (err) => `Extract failed: ${err.message}`
    })
  }
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isEditingPath, setIsEditingPath] = useState(false)

  // Defensive fallback for repoId and fingerprint
  const repoId = repo.repoId || repo._id
  const repoFingerprint = repo.repoFingerprint || ''
  const repoPath = repo.path || ''

  // State for editable fields
  const [name, setName] = useState(repo.name || '')
  const [description, setDescription] = useState(repo.description || '')
  const [newPath, setNewPath] = useState(repoPath)

  // Resets the form state if a new repo is selected while the modal is open
  useEffect(() => {
    setName(repo.name || '')
    setDescription(repo.description || '')
    setNewPath(repo.path || '')
    setIsEditingDetails(false)
    setIsEditingPath(false)
  }, [repo])

  const handleSync = async () => {
    if (!repoId) {
      toast.error('Cannot sync: Missing repository ID.')
      return
    }
    const promise = window.api.syncCommits(repoId)
    toast.promise(promise, {
      loading: `Syncing commits for ${repo.name}...`,
      success: (result) => {
        if (result.success) {
          onUpdate()
          return result.message || 'Sync successful!'
        }
        throw new Error(result.error)
      },
      error: (err) => `Sync failed: ${err.message}`
    })
  }

  const handleSaveDetails = async () => {
    if (!repoId) {
      toast.error('Cannot update: Missing repository ID.')
      return
    }
    const payload = { repoId, name, description }
    const promise = window.api.updateRepoDetails(payload)
    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (result) => {
        if (result.success) {
          setIsEditingDetails(false)
          onUpdate()
          return 'Details updated successfully!'
        }
        throw new Error(result.error)
      },
      error: (err) => `Update failed: ${err.message}`
    })
  }

  const handleBrowse = async () => {
    const result = await window.api.selectDirectory()
    if (result.success && result.path) setNewPath(result.path)
  }

  const handleUpdatePath = async () => {
    if (!repoId) {
      toast.error('Cannot update path: Missing repository ID.')
      return
    }
    if (!repoFingerprint) {
      toast.error('Cannot validate path: Remote fingerprint is missing.')
      return
    }
    if (!newPath) {
      toast.error('Please select a new path.')
      return
    }
    const promise = window.api.updateAndValidateRepoPath({
      repoId,
      newPath,
      remoteFingerprint: repoFingerprint
    })
    toast.promise(promise, {
      loading: 'Validating and updating path...',
      success: (result) => {
        if (result.success) {
          setIsEditingPath(false)
          onUpdate()
          return 'Path updated successfully!'
        }
        throw new Error(result.error)
      },
      error: (err) => `Update failed: ${err.message}`
    })
  }

  // Disable Save Path if missing required fields or offline
  const disableSavePath = !repoId || !repoFingerprint || !newPath || isOffline
  // Only disable if unsyncedCommits is explicitly 0; allow sync if undefined or missing, or offline
  const disableSync =
    isOffline ||
    (repo.unsyncedCommits !== undefined && repo.unsyncedCommits === 0) ||
    isEditingDetails ||
    isEditingPath ||
    !repoId

  return (
    <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-2xl w-full mx-4 relative">
      {/* Sync Now button in top right, hidden when editing */}
      {!isEditingDetails && !isEditingPath && (
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button 
            className="px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
            onClick={handleSync} 
            disabled={disableSync}
          >
            🔄 Sync Now
          </button>
          {isOffline && (
            <span className="text-red-500 font-medium">
              Offline: Actions disabled
            </span>
          )}
        </div>
      )}
      {isEditingDetails ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-2xl font-semibold bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded p-3 text-[var(--c-text-1)] outline-none focus:border-[var(--c-accent-1)] transition-colors mb-4"
          autoFocus
        />
      ) : (
        <h2 className="text-2xl font-semibold text-[var(--c-text-1)] mb-4 pr-32">{repo.name}</h2>
      )}

      {isEditingDetails ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] resize-none outline-none focus:border-[var(--c-accent-1)] transition-colors mb-6"
          rows={3}
          placeholder="Enter a description..."
        />
      ) : (
        <p className="text-[var(--c-text-2)] mb-6">{repo.description || 'No description provided.'}</p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <span className="block text-sm text-[var(--c-text-2)] mb-1">Status</span>
          <p className="font-medium text-[var(--c-text-1)]">{repo.status}</p>
        </div>
        <div className="text-center">
          <span className="block text-sm text-[var(--c-text-2)] mb-1">Total Commits</span>
          <p className="font-medium text-[var(--c-text-1)]">{repo.totalCommits ?? 'N/A'}</p>
        </div>
        <div className="text-center">
          <span className="block text-sm text-[var(--c-text-2)] mb-1">Unsynced</span>
          <p className={`font-medium ${repo.unsyncedCommits && repo.unsyncedCommits > 0 ? 'text-orange-500' : 'text-[var(--c-text-1)]'}`}>
            {repo.unsyncedCommits !== undefined && repo.unsyncedCommits !== null
              ? repo.unsyncedCommits
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--c-text-1)] mb-2">Local Path</label>
        {isEditingPath ? (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newPath} 
              readOnly 
              className="flex-1 p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none"
            />
            <button 
              onClick={handleBrowse}
              className="px-4 py-3 bg-[var(--c-bg-3)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-2)] transition-colors"
            >
              Browse...
            </button>
          </div>
        ) : (
          <p className="text-[var(--c-text-2)] text-sm" title={repoPath}>{repoPath}</p>
        )}
      </div>

      {/* Main actions only visible when not editing */}
      {!isEditingDetails && !isEditingPath && (
        <div className="flex gap-3 mb-4">
          <button
            className="flex-1 px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setIsEditingDetails(true)}
            disabled={isOffline}
          >
            Edit Details
          </button>
          <button
            className="flex-1 px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setIsEditingPath(true)}
            disabled={!repoId || !repoFingerprint || isOffline}
          >
            Update Path
          </button>
          <button 
            onClick={handleExtractCommits} 
            disabled={!repoId || isOffline}
            className="flex-1 px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Extract Commits
          </button>
        </div>
      )}
      {/* Show Save/Cancel row above if editing */}
      {isEditingDetails && (
        <div className="flex gap-3 justify-end">
          <button 
            className="px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors" 
            onClick={() => setIsEditingDetails(false)}
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveDetails} 
            disabled={!name.trim()}
            className="px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Details
          </button>
        </div>
      )}
      {isEditingPath && (
        <div className="flex gap-3 justify-end">
          <button 
            className="px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors" 
            onClick={() => setIsEditingPath(false)}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdatePath} 
            disabled={disableSavePath}
            className="px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Path
          </button>
        </div>
      )}
    </div>
  )
}

export default RepoDetailModal
