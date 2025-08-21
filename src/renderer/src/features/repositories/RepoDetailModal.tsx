import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../../components/Modal'
import { Repository } from '../../types'

interface RepoDetailModalProps {
  repo: Repository
  onUpdate: () => void
  isOffline: boolean
}

export function RepoDetailModal({
  repo,
  onUpdate,
  isOffline
}: RepoDetailModalProps): React.JSX.Element {
  const repoId = repo.repoId || (repo as any)._id
  const repoFingerprint = (repo as any).repoFingerprint
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isEditingPath, setIsEditingPath] = useState(false)
  const [name, setName] = useState(repo.name || '')
  const [description, setDescription] = useState(repo.description || '')
  const [newPath, setNewPath] = useState(repo.path || '')
  const disableSavePath = useMemo(() => !newPath || newPath === repo.path, [newPath, repo.path])

  const handleBrowse = async () => {
    try {
      const result = await (window.api as any).openDirectoryDialog?.()
      if ((result as any)?.filePaths?.[0]) {
        setNewPath((result as any).filePaths[0])
      }
    } catch {
      // ignore
    }
  }

  const handleSaveDetails = async (): Promise<void> => {
    if (!repoId) return
    const res = await window.api.updateRepoDetails?.({
      repoId,
      name: name.trim(),
      description: description.trim()
    })
    if (res?.success) {
      toast.success('Details updated')
      setIsEditingDetails(false)
      onUpdate()
    } else {
      toast.error(res?.error || 'Failed to update details')
    }
  }

  const handleUpdatePath = async (): Promise<void> => {
    if (!repoId || !repoFingerprint) return
    const res = await window.api.updateAndValidateRepoPath?.({
      repoId,
      newPath,
      remoteFingerprint: repoFingerprint
    })
    if (res?.success) {
      toast.success('Path updated')
      setIsEditingPath(false)
      onUpdate()
    } else {
      toast.error(res?.error || 'Failed to update path')
    }
  }

  const handleExtractCommits = async (): Promise<void> => {
    if (!repoId) return
    const tId = `extract-${repoId}`
    toast.loading('Extracting commits...', { id: tId })
    const res = await window.api.extractCommits(repoId)
    if (res.success) toast.success('Commits extracted', { id: tId })
    else toast.error(res.error || 'Extract failed', { id: tId })
  }

  const repoPath = repo.path

  return (
    <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-2xl w-full">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-[var(--c-text-1)]">{repo.name}</h2>
        {/* Close handled by outer Modal consumer */}
      </div>

      {/* Details section */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-[var(--c-text-1)] mb-2">Details</label>
        {isEditingDetails ? (
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none"
              placeholder="Repository name"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none resize-none"
              rows={3}
              placeholder="Description"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-[var(--c-text-1)] font-medium">{repo.name}</div>
            {repo.description && <div className="text-[var(--c-text-2)]">{repo.description}</div>}
          </div>
        )}
      </div>

      {/* Path section */}
      <div className="space-y-2 mb-6">
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
          <p className="text-[var(--c-text-2)] text-sm" title={repoPath}>
            {repoPath}
          </p>
        )}
      </div>

      {/* Action rows */}
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
