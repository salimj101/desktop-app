// src/renderer/src/pages/HomePage.tsx
import { User } from '../../../preload/index.d'
import styles from './HomePage.module.css'
import TodoList from '../components/TodoList' // Import the new component

interface HomePageProps {
  user: User
  onLogout: () => void
}

function HomePage({ user, onLogout }: HomePageProps): React.JSX.Element {
  const handleLogout = async (): Promise<void> => {
    await window.api.logout()
    onLogout()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeMessage}>
          Welcome, <span className={styles.email}>{user.email}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Embed the TodoList component */}
      <TodoList />
    </div>
  )
}

export default HomePage