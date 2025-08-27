import React from 'react'
import { GitBranch, Clock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Project {
  id: string
  name: string
  description: string
  repoCount: number
  lastUpdated: string
  status: string
}

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const statusColors: Record<string, string> = {
  Active: '#22C55E',
  Inactive: '#F59E42'
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { isDark } = useTheme()

  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 flex flex-col gap-4 w-full transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-[#F8FAFC] border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {project.name[0]}
          </div>
          <div className="min-w-0">
            <h2
              className={`text-xl font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {project.name}
            </h2>
            <p
              className={`text-sm truncate transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {project.description}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-semibold flex-shrink-0">
          {project.status}
        </span>
      </div>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-base">{project.repoCount}</span>
            <span
              className={`text-xs transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Repositories
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <span
            className={`text-xs transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Last updated {project.lastUpdated}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="text-blue-600 font-medium hover:underline text-sm flex items-center gap-1"
        >
          View Project <span className="project-link-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

export default ProjectCard
