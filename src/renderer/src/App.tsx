// src/renderer/src/App.tsx
import { useState, useEffect } from 'react'
import { User } from './types'
import LoginPage from './features/auth/LoginPage'
import MainLayout from './layouts/MainLayout'
import { Toaster } from 'react-hot-toast' // Import the Toaster component
import { ThemeProvider } from './contexts/ThemeContext'

function App(): React.JSX.Element {
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
    <ThemeProvider>
      {/* THE KEY ADDITION: The Toaster component is added here */}
      {/* It will listen for toast() calls from anywhere in the app */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#2ecc71', // Green for success
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red for error
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      {user ? (
        <MainLayout user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={setUser} />
      )}
    </ThemeProvider>
  )
}

export default App