import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../../components/Modal'
import { Repository } from '../../types'

interface SetupRepoModalProps {
  remoteRepo: Repository
  onSuccess: () => void
  onCancel: () => void
}

export function SetupRepoModal({
  remoteRepo,
  onSuccess,
  onCancel
}: SetupRepoModalProps): React.JSX.Element {
  const [localPath, setLocalPath] = useState(remoteRepo.path || '')
  const [isWorking, setIsWorking] = useState(false)

  const handleBrowse = async () => {
    try {
      const result = await (window.api as any).openDirectoryDialog?.()
      if ((result as any)?.filePaths?.[0]) {
        setLocalPath((result as any).filePaths[0])
      }
    } catch {
        console.log('Error opening directory dialog')
    }
  }

  const handleSetup = async () => {
    setIsWorking(true)
    try {
      const res = await window.api.setupMissingLocalRepo?.({
        remoteRepo: remoteRepo as any,
        localPath
      })
      if (res?.success) {
        toast.success('Repository set up')
        onSuccess()
      } else {
        toast.error(res?.error || 'Failed to set up repository')
      }
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onCancel}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Setup Repository</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
              Repository
            </label>
            <div className="text-[var(--c-text-1)] font-medium">{remoteRepo.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
              Local Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localPath}
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
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSetup}
            disabled={!localPath || isWorking}
            className="px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isWorking ? 'Setting up...' : 'Setup'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
