import styles from './CommitDetailModal.module.css'

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
        <h2>Commit Details</h2>
        <div className={styles.detailRow}>
          <strong>Hash:</strong> <span>{commit.commitHash}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Message:</strong> <span>{commit.message}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Branch:</strong> <span>{commit.branch}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Timestamp:</strong> <span>{new Date(commit.timestamp).toLocaleString()}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Synced:</strong> <span>{commit.synced ? 'Yes' : 'No'}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Status:</strong>{' '}
          <button className={styles.linkBtn} onClick={onShowStats}>
            View Stats
          </button>
        </div>
        <div className={styles.detailRow}>
          <strong>Parent:</strong> <span>{commit.parentCommit || '-'}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Changes:</strong>{' '}
          <button className={styles.linkBtn} onClick={onShowChanges}>
            View Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommitDetailModal
