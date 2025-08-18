// src/renderer/src/pages/RepositoriesPage.tsx
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import styles from './RepositoriesPage.module.css'
import Modal from '../components/Modal'
import RegisterRepoForm from '../components/RegisterRepoForm'

function RepositoriesPage(): React.JSX.Element {
  const [repositories, setRepositories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRepositories = async () => {
    setIsLoading(true)
    const result = await window.api.getRepositoriesView()
    if (result.success && result.repositories) {
      setRepositories(result.repositories)
      if (result.status === 'offline') {
        toast.error('Backend is offline. Displaying local data only.', { id: 'offline-toast' })
      }
    } else {
      toast.error(result.error || 'Failed to fetch repositories.')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  const handleRegisterSuccess = () => {
    setIsModalOpen(false)
    fetchRepositories() // Refresh the list
  }

  if (isLoading) return <div className={styles.centeredMessage}>Loading repositories...</div>

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Your Repositories</h2>
          <button onClick={() => setIsModalOpen(true)}>+ Register New Repository</button>
        </div>
        <div className={styles.repoList}>
          {repositories.length > 0 ? (
            repositories.map((repo) => (
              <div key={repo.id || repo._id} className={styles.repoCard}>
                <div className={styles.repoInfo}>
                  <h3>{repo.name}</h3>
                  <p className={styles.path} title={repo.path}>{repo.path}</p>
                </div>
                <span className={`${styles.status} ${styles[repo.syncStatus || repo.status]}`}>
                  {repo.syncStatus || repo.status}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.centeredMessage}>No repositories registered yet.</div>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RegisterRepoForm onSuccess={handleRegisterSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  )
}
export default RepositoriesPage