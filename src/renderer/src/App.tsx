// src/renderer/src/App.tsx
import { useState, useEffect } from 'react'
import { User } from '../../preload/index.d'
import LoginPage from './pages/LoginPage'
import MainLayout from './pages/MainLayout'
import { Toaster } from 'react-hot-toast' // Import the Toaster component

function App(): React.JSX.Element {
  // This useEffect for theming is perfect, no changes needed.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // --- THE DEFINITIVE FIX ---
  // The handleLogout function is now async and calls the backend API.
  const handleLogout = async (): Promise<void> => {
    // Step 1: Tell the main process to clear the session from the database.
    await window.api.logout()
    // Step 2: Clear the user from the React state to show the login page.
    setUser(null)
  }

  useEffect(() => {
    const checkSession = async () => {
      const result = await window.api.checkSession()
      if (result.isLoggedIn && result.user) {
        setUser(result.user)
      }
      setIsLoading(false)
    }

    checkSession()

    // This listener for background session expiry is also correct.
    const onSessionExpired = () => handleLogout()
    window.electron.ipcRenderer.on('session-expired', onSessionExpired)

    // Cleanup function
    return () => {
      window.electron.ipcRenderer.removeListener('session-expired', onSessionExpired)
    }
  }, [])

  if (isLoading) {
    return <div className="loading-screen">Checking session...</div>
  }

  // The login/logout logic in MainLayout is already passing the correct function.
  // The onLoginSuccess prop for LoginPage is also correct.
  return (
    <>
      {/* THE KEY ADDITION: The Toaster component is added here */}
      {/* It will listen for toast() calls from anywhere in the app */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--c-bg-3)', // Use our theme variable for the background
            color: 'var(--c-text-1)',      // Use our theme variable for the text
            border: '1px solid var(--c-border-1)',
          },
          success: {
            iconTheme: {
              primary: '#2ecc71', // Green for success
              secondary: 'var(--c-bg-2)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--c-danger)', // Red for error
              secondary: 'var(--c-bg-2)',
            },
          },
        }}
      />
      
      {user ? (
        <MainLayout user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={setUser} />
      )}
    </>
  )
}

export default App