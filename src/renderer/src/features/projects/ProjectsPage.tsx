// src/pages/ProjectsPage.tsx (Corrected Colors)

import React, { useEffect, useState } from 'react'
import ProjectsFilterBar from '../projects/ProjectsFilterBar'
import ProjectCard from './ProjectCard'
import '../../assets/main.css'
import { useTheme } from '../../contexts/ThemeContext'

// Updated Project interface to include the repositories array
interface Project {
  projectId: string
  name: string
  description: string
  status: string
  lastUpdated: string
  repositories: any[] // Repositories are now part of the project object
}

const ProjectsPage: React.FC = () => {
  // Assuming useTheme provides a simple string 'dark' or 'light'
  const { isDark } = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await window.api.getMyProjects()

        if (projectsRes.success && projectsRes.data) {
          setProjects(
            projectsRes.data.map((proj: any) => ({
              projectId: proj._id || proj.projectId,
              name: proj.name || 'Unnamed Project',
              description: proj.description || 'No description available.',
              status: proj.status ?? '-',
              lastUpdated: proj.lastUpdated ?? '-',
              repositories: proj.repositories ?? []
            }))
          )
        } else {
          setError(projectsRes.error || 'Failed to fetch projects.')
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div
      className={`max-w-7xl mx-auto p-4 sm:p-6 min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <h1
        className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        Projects
      </h1>
      <p
        className={`text-lg transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        } mb-6`}
      >
        Manage and track your development projects
      </p>

      <div className="mb-6 w-full">
        <ProjectsFilterBar />
      </div>

      {loading ? (
        <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading projects...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const repoCount = project.repositories.length

            return (
              <ProjectCard
                key={project.projectId}
                project={{
                  id: project.projectId,
                  name: project.name,
                  description: project.description,
                  repoCount,
                  lastUpdated: project.lastUpdated,
                  status: project.status
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
