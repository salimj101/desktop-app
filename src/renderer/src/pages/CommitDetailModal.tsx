interface CommitDetailModalProps {
  commit: any
  onClose: () => void
  onShowStats: () => void
  onShowChanges: () => void
}

const CommitDetailModal = ({
  commit,
  onClose,
  onShowStats,
  onShowChanges
}: CommitDetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[var(--c-text-2)] hover:text-[var(--c-text-1)] text-xl leading-none" 
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Commit Details</h2>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Hash:</strong> <span className="text-[var(--c-text-2)]">{commit.commitHash}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Message:</strong> <span className="text-[var(--c-text-2)]">{commit.message}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Branch:</strong> <span className="text-[var(--c-text-2)]">{commit.branch}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Timestamp:</strong> <span className="text-[var(--c-text-2)]">{new Date(commit.timestamp).toLocaleString()}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Synced:</strong> <span className="text-[var(--c-text-2)]">{commit.synced ? 'Yes' : 'No'}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Status:</strong>{' '}
          <button className="text-[var(--c-accent-1)] hover:underline bg-none border-none cursor-pointer" onClick={onShowStats}>
            View Stats
          </button>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Parent:</strong> <span className="text-[var(--c-text-2)]">{commit.parentCommit || '-'}</span>
        </div>
        <div className="mb-3">
          <strong className="text-[var(--c-text-1)]">Changes:</strong>{' '}
          <button className="text-[var(--c-accent-1)] hover:underline bg-none border-none cursor-pointer" onClick={onShowChanges}>
            View Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommitDetailModal
