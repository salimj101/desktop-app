import { useState } from 'react'
import toast from 'react-hot-toast'
import styles from './CreateBoardForm.module.css'

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Setup Local Repository</h2>
      <p className={styles.subtitle}>Please locate the local folder for <strong>{remoteRepo.name}</strong>.</p>
      <div className={styles.formGroup}>
        <label>Local Path</label>
        <div className={styles.pathInputGroup}>
          <input type="text" value={path} placeholder="Click Browse to select..." readOnly />
          <button type="button" onClick={handleBrowse}>Browse...</button>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
        <button type="submit">Validate & Save</button>
      </div>
    </form>
  )
}
export default SetupRepoModal