import { useState } from 'react'
import toast from 'react-hot-toast'

function SetupRepoModal({ remoteRepo, onSuccess, onCancel }): React.JSX.Element {
  const [path, setPath] = useState('')

  const handleBrowse = async () => {
    const result = await window.api.selectDirectory();
    if (result.success && result.path) setPath(result.path);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path) return toast.error("Please select the local path for this repository.");

    // The remoteRepo object from getRepositoriesView now has the fingerprint
    const promise = window.api.setupMissingLocalRepo({ remoteRepo: { ...remoteRepo, path }, localPath: path });

    toast.promise(promise, {
      loading: 'Validating and setting up repository...',
      success: (result) => {
        if (result.success) { onSuccess(); return "Repository setup complete!"; }
        throw new Error(result.error);
      },
      error: (err) => `Setup failed: ${err.message}`
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-2">Setup Local Repository</h2>
      <p className="text-sm text-[var(--c-text-2)] mb-4">Please locate the local folder for <strong className="text-[var(--c-text-1)]">{remoteRepo.name}</strong>.</p>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--c-text-1)]">Local Path</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={path} 
            placeholder="Click Browse to select..." 
            readOnly 
            className="flex-1 p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none"
          />
          <button 
            type="button" 
            onClick={handleBrowse}
            className="px-4 py-3 bg-[var(--c-bg-3)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-2)] transition-colors"
          >
            Browse...
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] transition-colors"
        >
          Validate & Save
        </button>
      </div>
    </form>
  )
}
export default SetupRepoModal