import React from 'react'
import ProjectsFilterBar from '../projects/ProjectsFilterBar'
import ProjectCard from './ProjectCard'
// import mockProjects from "../../data/mockProjects";
import '../../assets/main.css'
import useTheme from '../../hooks/useTheme'

import { useEffect, useState } from 'react'

interface Project {
  status: string
  lastUpdated: string
  projectId: string
  name: string
  description: string
}

interface Repository {
  id: string
  name: string
  description: string
  path: string
  projectId?: string
}

const ProjectsPage: React.FC = () => {
  const { theme } = useTheme ? useTheme() : { theme: 'light' }
  const [projects, setProjects] = useState<Project[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, reposRes] = await Promise.all([
          window.api.getMyProjects(),
          window.api.getRepositoriesView()
        ])
        if (projectsRes.success && projectsRes.data) {
          setProjects(
            projectsRes.data.map((proj: any) => ({
              projectId: proj.projectId,
              name: proj.name,
              description: proj.description,
              status: proj.status ?? '-',
              lastUpdated: proj.lastUpdated ?? '-'
            }))
          )
        } else {
          setError(projectsRes.error || 'Failed to fetch projects.')
        }
        if (reposRes.success && reposRes.repositories) {
          setRepositories(reposRes.repositories)
        }
      } catch (err) {
        setError('Failed to fetch projects or repositories.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div
      className={`px-12 pt-10 pb-4 w-full min-h-screen ${theme === 'dark' ? 'bg-[#18181B]' : 'bg-white'}`}
    >
      <h1
        className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}
      >
        Projects
      </h1>
      <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-8`}>
        Manage and track your development projects
      </p>
      <div className="flex gap-4 mb-8">
        <ProjectsFilterBar />
      </div>
      {loading ? (
        <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
          Loading projects...
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => {
            const repoCount = repositories.filter(
              (repo) => repo.projectId === project.projectId
            ).length
            return (
              <ProjectCard
                key={project.projectId}
                project={{
                  id: project.projectId,
                  name: project.name,
                  description: project.description,
                  repoCount,
                  lastUpdated: project.lastUpdated || '-',
                  status: project.status || '-',
                  theme: theme
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
