import { useState, useEffect } from 'react'

interface Version {
  id: string
  version: string
  releaseDate: string
  description: string
  changes: string[]
}

export function Versions(): React.JSX.Element {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      version: '1.0.0',
      releaseDate: '2024-01-15',
      description: 'Initial release of Git Tracker Desktop App',
      changes: [
        'Git repository tracking and monitoring',
        'Kanban board management',
        'Commit history and analysis',
        'Repository health monitoring',
        'Todo list management',
        'Dark/light theme support'
      ]
    }
  ])

  const [selectedVersion, setSelectedVersion] = useState<string>('1')

  const selectedVersionData = versions.find(v => v.id === selectedVersion)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--c-text-1)] mb-8 text-center">
        Version History
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">
            Releases
          </h2>
          <div className="space-y-2">
            {versions.map((version) => (
              <button
                key={version.id}
                onClick={() => setSelectedVersion(version.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedVersion === version.id
                    ? 'border-[var(--c-accent-1)] bg-[var(--c-accent-1)] text-white'
                    : 'border-[var(--c-border-1)] bg-[var(--c-bg-2)] text-[var(--c-text-1)] hover:bg-[var(--c-bg-3)]'
                }`}
              >
                <div className="font-medium">v{version.version}</div>
                <div className="text-sm opacity-80">{version.releaseDate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Version Details */}
        <div className="lg:col-span-2">
          {selectedVersionData && (
            <div className="bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[var(--c-text-1)]">
                  v{selectedVersionData.version}
                </h2>
                <span className="text-sm text-[var(--c-text-2)]">
                  {selectedVersionData.releaseDate}
                </span>
              </div>

              <p className="text-[var(--c-text-2)] mb-6 leading-relaxed">
                {selectedVersionData.description}
              </p>

              <div>
                <h3 className="text-lg font-semibold text-[var(--c-text-1)] mb-3">
                  What's New
                </h3>
                <ul className="space-y-2">
                  {selectedVersionData.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[var(--c-accent-1)] mt-1">•</span>
                      <span className="text-[var(--c-text-1)]">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
