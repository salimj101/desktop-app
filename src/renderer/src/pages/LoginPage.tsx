// src/renderer/src/pages/LoginPage.tsx
import { useState } from 'react'
import { User } from '../../../preload/index.d'
import styles from './LoginPage.module.css'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

function LoginPage({ onLoginSuccess }: LoginPageProps): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await window.api.login({ email, password })

    setIsLoading(false)

    if (result.success && result.user) {
      onLoginSuccess(result.user)
    } else {
      setError(result.error || 'An unknown error occurred.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2>Developer Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage