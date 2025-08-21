// src/renderer/src/components/ThemeSwitcher.tsx
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

function ThemeSwitcher(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button 
      onClick={toggleTheme} 
      className="bg-transparent border border-[var(--c-border-1)] text-[var(--c-text-2)] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--c-bg-3)] hover:text-[var(--c-text-1)]" 
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="material-icons text-[20px]">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  )
}
export default ThemeSwitcher