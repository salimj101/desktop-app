import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface LoginPageProps {
  onLoginSuccess: (user: any) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { theme, isDark } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await window.api.login({ email, password })
      
      if (result.success && result.user) {
        onLoginSuccess(result.user)
      } else {
        setError(result.error || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-blue-600' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-purple-600' : 'bg-purple-400'
        }`}></div>
      </div>

      {/* Main Login Card */}
      <div className={`relative w-full max-w-sm p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
          : 'bg-white border border-gray-200 shadow-gray-200/50'
      }`}>
        {/* GitTracker Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
            <svg 
              className="w-12 h-12 text-white" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl font-bold mb-3 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back
          </h1>
          <p className={`text-base transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sign in to your GitTracker account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-300 hover:bg-gray-100 ${
                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                {showPassword ? (
                  <EyeOff className={`w-4 h-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                ) : (
                  <Eye className={`w-4 h-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={`w-4 h-4 rounded border-2 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-blue-600' 
                  : 'bg-white border-gray-300 text-blue-600'
              }`}
            />
            <label htmlFor="remember-me" className={`ml-2 text-sm transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold text-base rounded-xl transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
              isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Bottom Left Icon */}
      <div className={`absolute bottom-8 left-8 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-700' : 'bg-gray-800'
      }`}>
        <span className="text-white font-bold text-sm">N</span>
      </div>
    </div>
  )
}
