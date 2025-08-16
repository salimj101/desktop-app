// src/renderer/src/App.tsx
import { useState, useEffect } from 'react'
import { User } from '../../preload/index.d'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On component mount, check if there's an existing session
  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const result = await window.api.checkSession()
      if (result.isLoggedIn && result.user) {
        setUser(result.user)
      }
      setIsLoading(false)
    }
    checkSession()
  }, [])

  const handleLoginSuccess = (loggedInUser: User): void => {
    setUser(loggedInUser)
  }

  const handleLogout = (): void => {
    setUser(null)
  }

  // --- NEW CODE STARTS HERE ---
  // Listen for 'session-expired' events pushed from the main process.
  // This handles cases where a background session check fails (e.g., on window focus).
  useEffect(() => {
    // Define the event handler
    const handleSessionExpired = (): void => {
      console.log('Session expired event received. Logging out.')
      handleLogout()
    }

    // Set up the listener
    window.electron.ipcRenderer.on('session-expired', handleSessionExpired)

    // Clean up the listener when the component unmounts to prevent memory leaks
    return () => {
      window.electron.ipcRenderer.removeAllListeners('session-expired')
    }
  }, []) // Empty dependency array ensures this listener is set up only once.
  // --- NEW CODE ENDS HERE ---

  // Show a loading indicator while we check the session
  if (isLoading) {
    return <div className="loading-screen">Checking session...</div>
  }

  // Conditionally render the correct page
  return (
    <div className="container">
      {user ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App