import { useEffect, useState } from 'react'
import { CommitDetailModal } from './CommitDetailModal'
import { Commit } from '../../types'

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
    <div className="p-8">
      <h1>Projects &gt; Repositories &gt; Commits</h1>
      <div className="flex flex-col gap-8 mt-8">
        {repos.map((repo) => (
          <div key={repo.repoId} className="border-[1.5px] border-[var(--c-border-1)] rounded-[10px] bg-[var(--c-bg-2)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div
              className="flex items-center justify-between py-[1.1rem] px-6 text-[1.15rem] font-semibold bg-[var(--c-bg-3)] rounded-[10px_10px_0_0] cursor-pointer select-none transition-colors hover:bg-[var(--c-accent-1)] hover:text-white"
              onClick={() => setExpandedRepo(expandedRepo === repo.repoId ? null : repo.repoId)}
            >
              <span className="flex-[2]">{repo.repoName}</span>
              <span className="flex-1 text-right text-[var(--c-text-2)]">{repo.totalCommits} commits</span>
              <span className="ml-6 text-[1.2em]">{expandedRepo === repo.repoId ? '▼' : '▶'}</span>
            </div>
            {expandedRepo === repo.repoId && (
              <div className="max-h-[60vh] overflow-y-auto border border-[var(--c-border-1)] rounded-lg bg-[var(--c-bg-2)]">
                {(repo.commits ?? []).length === 0 ? (
                  <div className="p-6 text-[var(--c-text-3)] text-center italic">No commits yet.</div>
                ) : (
                  (repo.commits ?? []).map((commit) => (
                    <div
                      key={commit.id}
                      className={`flex items-center gap-4 py-3 px-4 border-b border-[var(--c-border-1)] cursor-pointer transition-colors hover:bg-[var(--c-bg-3)] last:border-b-0 ${
                        commit.synced ? 'opacity-70' : 'font-semibold text-[var(--c-accent-1)]'
                      }`}
                      onClick={() => {
                        setSelectedCommit(commit)
                        setModalType('detail')
                        setModalCommit(commit)
                      }}
                    >
                      <div className="font-mono min-w-[70px]">{commit.commitHash.slice(0, 8)}</div>
                      <div className="flex-[2] whitespace-nowrap overflow-hidden text-ellipsis">{commit.message}</div>
                      <div className="flex-1 text-[var(--c-text-2)]">{commit.branch}</div>
                      <div className="flex-[1.2] text-[var(--c-text-3)] text-[0.95em]">
                        {new Date(commit.timestamp).toLocaleString()}
                      </div>
                      <div className="min-w-[90px] text-right">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button 
          className="mb-4 px-3 py-1 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors" 
          onClick={onBack}
        >
          &larr; Detail
        </button>
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Commit Stats</h2>
        {parsed ? (
          <ul className="space-y-2">
            {Object.entries(parsed).map(([k, v]) => (
              <li key={k} className="flex gap-2">
                <span className="font-medium text-[var(--c-text-1)]">
                  <strong>{k}</strong>:
                </span>
                <span className="text-[var(--c-text-2)]">{v as any}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-[var(--c-text-2)] py-4">No stats available.</div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button 
          className="mb-4 px-3 py-1 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors" 
          onClick={onBack}
        >
          &larr; Detail
        </button>
        <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Commit Changes</h2>
        {parsed && parsed.length ? (
          <ul className="space-y-2">
            {parsed.map((chg: any, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <strong className="text-[var(--c-text-1)]">{chg.fileName}</strong>
                <span className="text-green-500 font-mono text-sm">+{chg.added}</span>
                <span className="text-red-500 font-mono text-sm">-{chg.removed}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-[var(--c-text-2)] py-4">No changes available.</div>
        )}
      </div>
    </div>
  )
}

export default CommitsPage
