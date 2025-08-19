// src/renderer/src/components/RepoDetailModal.tsx
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import styles from './RepoDetailModal.module.css'
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
    <div className={styles.container}>
      {/* Sync Now button in top right, hidden when editing */}
      {!isEditingDetails && !isEditingPath && (
        <div className={styles.topRight}>
          <button className={styles.syncBtn} onClick={handleSync} disabled={disableSync}>
            🔄 Sync Now
          </button>
          {isOffline && (
            <span style={{ color: 'var(--c-danger)', marginLeft: 12, fontWeight: 500 }}>
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
          className={styles.titleInput}
          autoFocus
        />
      ) : (
        <h2>{repo.name}</h2>
      )}

      {isEditingDetails ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.descriptionInput}
          rows={3}
          placeholder="Enter a description..."
        />
      ) : (
        <p className={styles.description}>{repo.description || 'No description provided.'}</p>
      )}

      <div className={styles.statsGrid}>
        <div>
          <span>Status</span>
          <p>{repo.status}</p>
        </div>
        <div>
          <span>Total Commits</span>
          <p>{repo.totalCommits ?? 'N/A'}</p>
        </div>
        <div>
          <span>Unsynced</span>
          <p className={repo.unsyncedCommits && repo.unsyncedCommits > 0 ? styles.unsynced : ''}>
            {repo.unsyncedCommits !== undefined && repo.unsyncedCommits !== null
              ? repo.unsyncedCommits
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className={styles.pathSection}>
        <label>Local Path</label>
        {isEditingPath ? (
          <div className={styles.pathInputGroup}>
            <input type="text" value={newPath} readOnly />
            <button onClick={handleBrowse}>Browse...</button>
          </div>
        ) : (
          <p title={repoPath}>{repoPath}</p>
        )}
      </div>

      {/* Main actions only visible when not editing */}
      {!isEditingDetails && !isEditingPath && (
        <div className={styles.buttonGroup}>
          <button
            className={styles.secondaryBtn}
            onClick={() => setIsEditingDetails(true)}
            disabled={isOffline}
          >
            Edit Details
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setIsEditingPath(true)}
            disabled={!repoId || !repoFingerprint || isOffline}
          >
            Update Path
          </button>
          <button onClick={handleExtractCommits} disabled={!repoId || isOffline}>
            Extract Commits
          </button>
        </div>
      )}
      {/* Show Save/Cancel row above if editing */}
      {isEditingDetails && (
        <div className={styles.editRow}>
          <button className={styles.secondaryBtn} onClick={() => setIsEditingDetails(false)}>
            Cancel
          </button>
          <button onClick={handleSaveDetails} disabled={!name.trim()}>
            Save Details
          </button>
        </div>
      )}
      {isEditingPath && (
        <div className={styles.editRow}>
          <button className={styles.secondaryBtn} onClick={() => setIsEditingPath(false)}>
            Cancel
          </button>
          <button onClick={handleUpdatePath} disabled={disableSavePath}>
            Save Path
          </button>
        </div>
      )}
    </div>
  )
}

export default RepoDetailModal
