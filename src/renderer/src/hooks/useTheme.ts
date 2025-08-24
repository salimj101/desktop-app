import { useState, useEffect } from 'react'

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme')
    if (stored) return stored
    // Optionally, use prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  return 'light'
}

const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme())

  useEffect(() => {
    const handleStorage = () => {
      setTheme(getInitialTheme())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme, setTheme }
}

export default useTheme
