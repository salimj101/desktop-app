import { Modal } from '../../components/Modal'

interface Commit {
  _id: string
  hash: string
  message: string
  author: string
  email: string
  date: string
  repository: string
  changes?: {
    files: string[]
    additions: number
    deletions: number
  }
}

interface CommitDetailModalProps {
  commit: Commit
  isOpen: boolean
  onClose: () => void
}

export function CommitDetailModal({ commit, isOpen, onClose }: CommitDetailModalProps): React.JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-[var(--c-text-1)]">
            Commit Details
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--c-text-2)] hover:text-[var(--c-text-1)] text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Commit Hash */}
          <div>
            <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
              Commit Hash
            </label>
            <p className="font-mono text-sm bg-[var(--c-bg-2)] p-2 rounded border border-[var(--c-border-1)]">
              {commit.hash}
            </p>
          </div>

          {/* Commit Message */}
          <div>
            <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
              Message
            </label>
            <p className="text-[var(--c-text-1)] bg-[var(--c-bg-2)] p-3 rounded border border-[var(--c-border-1)]">
              {commit.message}
            </p>
          </div>

          {/* Author Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
                Author
              </label>
              <p className="text-[var(--c-text-1)] font-medium">
                {commit.author}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
                Email
              </label>
              <p className="text-[var(--c-text-1)]">
                {commit.email}
              </p>
            </div>
          </div>

          {/* Date and Repository */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
                Date
              </label>
              <p className="text-[var(--c-text-1)]">
                {new Date(commit.date).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
                Repository
              </label>
              <p className="text-[var(--c-text-1)] font-medium">
                {commit.repository}
              </p>
            </div>
          </div>

          {/* Changes Summary */}
          {commit.changes && (
            <div>
              <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
                Changes Summary
              </label>
              <div className="bg-[var(--c-bg-2)] p-4 rounded border border-[var(--c-border-1)]">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      +{commit.changes.additions}
                    </div>
                    <div className="text-sm text-[var(--c-text-2)]">Additions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      -{commit.changes.deletions}
                    </div>
                    <div className="text-sm text-[var(--c-text-2)]">Deletions</div>
                  </div>
                </div>
                
                {commit.changes.files.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-[var(--c-text-2)] mb-2">
                      Modified Files:
                    </div>
                    <div className="space-y-1">
                      {commit.changes.files.map((file, index) => (
                        <div key={index} className="text-sm text-[var(--c-text-1)] font-mono bg-[var(--c-bg-3)] px-2 py-1 rounded">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
