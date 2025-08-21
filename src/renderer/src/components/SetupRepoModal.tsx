import { useState } from 'react'
import { Modal } from './Modal'

interface SetupRepoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  repoPath: string
}

export function SetupRepoModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  repoPath 
}: SetupRepoModalProps): React.JSX.Element {
  const [isSettingUp, setIsSettingUp] = useState(false)

  const handleSetup = async () => {
    setIsSettingUp(true)
    try {
      // Call the setup repository API
      const result = await window.api.setupRepo(repoPath)
      if (result.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Failed to setup repository:', error)
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">
          Setup Repository
        </h2>
        
        <div className="mb-6">
          <p className="text-[var(--c-text-2)] mb-3">
            The repository at the following path needs to be set up:
          </p>
          <div className="bg-[var(--c-bg-2)] p-3 rounded border border-[var(--c-border-1)]">
            <code className="text-sm text-[var(--c-text-1)] break-all">
              {repoPath}
            </code>
          </div>
        </div>

        <p className="text-[var(--c-text-2)] mb-6">
          This will initialize the repository tracking and sync it with your account.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSetup}
            disabled={isSettingUp}
            className="flex-1 bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {isSettingUp ? 'Setting up...' : 'Setup Repository'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[var(--c-bg-3)] text-[var(--c-text-2)] border-none py-2 px-4 rounded font-medium cursor-pointer hover:bg-[var(--c-bg-4)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}