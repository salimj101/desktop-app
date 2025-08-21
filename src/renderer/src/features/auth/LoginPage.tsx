import { useState } from 'react'
import { User } from '../../types'

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--c-bg-1)] relative before:content-[''] before:absolute before:w-[250vmin] before:h-[250vmin] before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[radial-gradient(circle,var(--c-bg-2)_0%,var(--c-bg-1)_50%)] before:z-[1]">
      <div className="flex items-center justify-center w-full bg-transparent">
        <div className="w-full max-w-[400px] p-10 bg-[var(--c-bg-2)] rounded-lg border border-[var(--c-border-1)] shadow-[0_10px_25px_var(--c-shadow)] relative z-[2]">
          {/* App brand pinned top-left */}
          <div className="absolute top-3 left-4 text-sm font-bold text-[var(--c-accent-1)] select-none">GitTracker</div>

          {/* Main login title */}
          <h2 className="m-0 mb-6 text-center text-[22px] font-semibold text-[var(--c-text-1)]">Developer Login</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative mb-2">
              <label htmlFor="email" className="block mb-[6px] text-[13px] text-[var(--c-text-2)]">Email</label>
              <input
                autoComplete="username"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-0 text-[15px] text-[var(--c-text-1)] border-none border-b border-[var(--c-border-2)] outline-none bg-transparent mt-0"
              />
            </div>

            <div className="relative mb-2">
              <label htmlFor="password" className="block mb-[6px] text-[13px] text-[var(--c-text-2)]">Password</label>
              <div className="relative flex items-center">
                <input
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 py-3 px-0 pr-9 text-[15px] text-[var(--c-text-1)] border-none border-b border-[var(--c-border-2)] outline-none bg-transparent mt-0"
                />
                <button
                  type="button"
                  className="absolute right-[6px] top-1/2 transform -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center bg-transparent border-none p-0 m-0 cursor-pointer text-[var(--c-text-2)] rounded hover:text-[var(--c-accent-1)] focus:text-[var(--c-accent-1)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <p className="text-[var(--c-danger)] text-center mb-2 text-[13px]">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-5 text-base font-semibold text-[var(--c-button-text)] bg-[var(--c-button-bg)] border border-[var(--c-border-1)] rounded-md cursor-pointer transition-all duration-150 hover:bg-[var(--c-button-hover-bg)] hover:transform hover:-translate-y-px disabled:bg-[var(--c-border-1)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          {/* Signup placeholder */}
          <p className="mt-4 text-center text-[13px] text-[var(--c-text-2)]">
            Don't have an account? <a href="#" className="text-[var(--c-accent-1)] no-underline font-semibold hover:underline">Sign up (coming soon)</a>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
