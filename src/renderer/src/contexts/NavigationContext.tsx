import { createContext, useContext, useState, ReactNode } from 'react'

export type PageType = 'dashboard' | 'repositories' | 'projects' | 'repoHealth' | 'commits' | 'todo' | 'kanban' | 'publicBoards'

interface NavigationContextType {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  return (
    <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
