/// <reference types="vite/client" />

interface Window {
  api: {
    getCommits: () => Promise<{ success: boolean; data: any }>
    // ...add other api methods as needed
  }
}
