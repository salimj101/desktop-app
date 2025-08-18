// src/renderer/src/components/ThemeSwitcher.tsx
import { useState, useEffect } from 'react'
import styles from './ThemeSwitcher.module.css'
const ICONS = { Sun: '☀️', Moon: '🌙' }
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
<button onClick={toggleTheme} className={styles.themeToggle} title="Toggle Theme">
{theme === 'light' ? ICONS.Moon : ICONS.Sun}
</button>
)
}
export default ThemeSwitcher