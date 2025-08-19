import { useEffect, useState } from 'react'
import styles from './CommitsPage.module.css'
import CommitDetailModal from './CommitDetailModal'

interface Commit {
  id: number
  repoId: string
  developerId?: string
  projectId?: string
  branch: string
  message: string
  commitHash: string
  timestamp: string
  stats?: string
  changes?: string
  parentCommit?: string
  synced: boolean
  createdAt: string
  updatedAt: string
}

interface RepoCommits {
  repoId: string
  repoName: string
  totalCommits: number
  commits: Commit[]
}

const CommitsPage = () => {
  const [repos, setRepos] = useState<RepoCommits[]>([])
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [modalType, setModalType] = useState<'detail' | 'stats' | 'changes' | null>(null)
  const [modalCommit, setModalCommit] = useState<Commit | null>(null)

  useEffect(() => {
    window.api
      .getCommits()
      .then((result: { success: boolean; data: RepoCommits[]; status?: string }) => {
        if (result.success) {
          setRepos(result.data)
          if (result.status === 'offline') {
            // Use a toast or alert to warn user
            if (window?.toast) {
              window.toast.error('You are offline. Commit updates and sync are unavailable.')
            } else {
              alert('You are offline. Commit updates and sync are unavailable.')
            }
          }
        }
      })
  }, [])

  // Modal close on overlay click
  const closeModal = () => {
    setModalType(null)
    setModalCommit(null)
    setSelectedCommit(null)
  }

  return (
    <div className={styles.container}>
      <h1>Projects &gt; Repositories &gt; Commits</h1>
      <div className={styles.repoList}>
        {repos.map((repo) => (
          <div key={repo.repoId} className={styles.repoBlock}>
            <div
              className={styles.repoHeader}
              onClick={() => setExpandedRepo(expandedRepo === repo.repoId ? null : repo.repoId)}
            >
              <span className={styles.repoName}>{repo.repoName}</span>
              <span className={styles.repoCount}>{repo.totalCommits} commits</span>
              <span className={styles.expandIcon}>{expandedRepo === repo.repoId ? '▼' : '▶'}</span>
            </div>
            {expandedRepo === repo.repoId && (
              <div className={styles.commitsList}>
                {(repo.commits ?? []).length === 0 ? (
                  <div className={styles.emptyMsg}>No commits yet.</div>
                ) : (
                  (repo.commits ?? []).map((commit) => (
                    <div
                      key={commit.id}
                      className={
                        styles.commitRow + ' ' + (commit.synced ? styles.synced : styles.unsynced)
                      }
                      onClick={() => {
                        setSelectedCommit(commit)
                        setModalType('detail')
                        setModalCommit(commit)
                      }}
                    >
                      <div className={styles.hash}>{commit.commitHash.slice(0, 8)}</div>
                      <div className={styles.message}>{commit.message}</div>
                      <div className={styles.branch}>{commit.branch}</div>
                      <div className={styles.time}>
                        {new Date(commit.timestamp).toLocaleString()}
                      </div>
                      <div className={styles.status}>
                        {commit.synced ? '✅ Synced' : '🕓 Unsynced'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {modalType === 'detail' && modalCommit && (
        <CommitDetailModal
          commit={modalCommit}
          onClose={closeModal}
          onShowStats={() => {
            setModalType('stats')
            setModalCommit(modalCommit)
          }}
          onShowChanges={() => {
            setModalType('changes')
            setModalCommit(modalCommit)
          }}
        />
      )}
      {modalType === 'stats' && modalCommit && (
        <CommitStatsModal
          stats={modalCommit.stats}
          onClose={closeModal}
          onBack={() => setModalType('detail')}
        />
      )}
      {modalType === 'changes' && modalCommit && (
        <CommitChangesModal
          changes={modalCommit.changes}
          onClose={closeModal}
          onBack={() => setModalType('detail')}
        />
      )}
    </div>
  )
}

// Placeholder for new modals
function CommitStatsModal({
  stats,
  onClose,
  onBack
}: {
  stats?: string
  onClose: () => void
  onBack: () => void
}) {
  let parsed = null
  try {
    parsed = stats ? JSON.parse(stats) : null
  } catch {}
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.backBtn} onClick={onBack}>
          &larr; Detail
        </button>
        <h2>Commit Stats</h2>
        {parsed ? (
          <ul>
            {Object.entries(parsed).map(([k, v]) => (
              <li key={k}>
                <span className={styles.statKey}>
                  <strong>{k}</strong>:
                </span>{' '}
                <span>{v as any}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyMsg}>No stats available.</div>
        )}
      </div>
    </div>
  )
}
function CommitChangesModal({
  changes,
  onClose,
  onBack
}: {
  changes?: string
  onClose: () => void
  onBack: () => void
}) {
  let parsed: any[] | null = null
  try {
    const temp = changes ? JSON.parse(changes) : null
    parsed = Array.isArray(temp) ? temp : null
  } catch {}
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.backBtn} onClick={onBack}>
          &larr; Detail
        </button>
        <h2>Commit Changes</h2>
        {parsed && parsed.length ? (
          <ul>
            {parsed.map((chg: any, i: number) => (
              <li key={i}>
                <strong>{chg.fileName}</strong>
                <span className={styles.added}>+{chg.added}</span>
                <span className={styles.removed}>-{chg.removed}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyMsg}>No changes available.</div>
        )}
      </div>
    </div>
  )
}

export default CommitsPage
