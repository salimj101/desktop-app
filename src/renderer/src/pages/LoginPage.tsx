import { useState } from 'react'
import { User } from '../../../preload/index.d'
import styles from './LoginPage.module.css'

/* Small inline SVG icons — small, crisp, theme-aware (use currentColor) */
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 3l18 18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 10.5a2.5 2.5 0 0 0 3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12s4-7 10-7c2.14 0 4.16.5 5.92 1.36"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.5 16.5C20 17.7 17.9 18.5 15 18.5c-6 0-10-6-10-6 .9-1.3 2.3-2.7 4-3.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function LoginPage({
  onLoginSuccess
}: {
  onLoginSuccess: (user: User) => void
}): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const result = await window.api.login({ email, password })
    setIsLoading(false)
    if (result.success && result.user) onLoginSuccess(result.user)
    else setError(result.error || 'An unknown error occurred.')
  }

  return (
    <div className={`${styles.backgroundWrapper}`}>
      <div className={`${styles.container} content-container`}>
        <div className={styles.loginBox}>
          {/* App brand pinned top-left */}
          <div className={styles.brand}>GitTracker</div>

          {/* Main login title */}
          <h2>Developer Login</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                autoComplete="username"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          {/* Signup placeholder */}
          <p className={styles.signupText}>
            Don’t have an account? <a href="#">Sign up (coming soon)</a>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
