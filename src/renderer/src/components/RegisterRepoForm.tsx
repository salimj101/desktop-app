import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import styles from './CreateBoardForm.module.css'

interface Project { _id: string; name: string; }
interface RegisterRepoFormProps { onSuccess: () => void; onCancel: () => void; }

function RegisterRepoForm({ onSuccess, onCancel }: RegisterRepoFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [path, setPath] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // State to prevent double-clicks

  useEffect(() => {
    const fetchProjects = async () => {
      const result = await window.api.getMyProjects()
      if (result.success && result.data) {
        setProjects(result.data)
        setIsOffline(false)
        if (result.data.length > 0) setProjectId(result.data[0]._id)
      } else {
        toast.error('Could not fetch projects. Are you offline?', { id: 'projects-offline' })
        setIsOffline(true)
      }
    }
    fetchProjects()
  }, [])

  const handleBrowse = async () => {
    const result = await window.api.selectDirectory()
    if (result.success && result.path) {
      setPath(result.path)
      const pathParts = result.path.replace(/\\/g, '/').split('/')
      setName(pathParts[pathParts.length - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !path.trim() || !projectId) {
      return toast.error('Name, Path, and Project are all required.')
    }
    
    setIsSubmitting(true);

    const promise = window.api.registerRepo({ name, description, path, projectId })

    toast.promise(promise, {
      loading: 'Validating and registering repository...',
      success: (result) => {
        if (result.success) {
          onSuccess() // This closes the modal and refreshes the list
          return 'Repository registered successfully!' // This becomes the success message
        } else {
          // IMPORTANT: We throw the specific error from the backend
          // This passes control to the 'error' part of the toast
          throw new Error(result.error || 'An unknown error occurred.')
        }
      },
      error: (err) => `Registration failed: ${err.message}` // This displays the exact backend error
    }).finally(() => {
      // Re-enable the submit button whether it succeeded or failed
      setIsSubmitting(false)
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Register a New Repository</h2>
      <div className={styles.formGroup}><label htmlFor="repoName">Repository Name</label><input id="repoName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Awesome Project" /></div>
      <div className={styles.formGroup}><label htmlFor="repoDesc">Description (Optional)</label><input id="repoDesc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className={styles.formGroup}>
        <label htmlFor="repoPath">Full Local Path</label>
        <div className={styles.pathInputGroup}>
          <input id="repoPath" type="text" value={path} placeholder="Click Browse to select a folder..." readOnly />
          <button type="button" onClick={handleBrowse}>Browse...</button>
        </div>
      </div>
      <div className={styles.formGroup}><label htmlFor="project">Assign to Project</label><select id="project" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={isOffline || projects.length === 0} className={styles.select}>
          {isOffline ? (<option>Cannot fetch projects while offline</option>) : projects.length > 0 ? (projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)) : (<option>No projects found for your account</option>)}
        </select></div>
      <div className={styles.buttonGroup}><button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button><button type="submit" className={styles.submitBtn} disabled={isOffline || isSubmitting}>Register Repository</button></div>
    </form>
  )
}
export default RegisterRepoForm