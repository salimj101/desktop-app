import { NavigationProvider } from '../contexts/NavigationContext'
import MainContent from '../components/MainContent'

interface MainLayoutProps {
  user: any
  onLogout: () => void
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  return (
    <NavigationProvider>
      <MainContent user={user} onLogout={onLogout} />
    </NavigationProvider>
  )
}
