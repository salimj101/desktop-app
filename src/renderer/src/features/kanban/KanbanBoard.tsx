import React, { useState } from 'react'
import useTheme from '../../hooks/useTheme'

const priorities = [
  { label: 'High', color: 'bg-red-100 text-red-600', badge: 'bg-red-100 text-red-600' },
  {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-600'
  },
  { label: 'Low', color: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-600' }
]

const initialColumns = [
  {
    id: 1,
    name: 'To Do',
    color: 'border-blue-400',
    header: 'bg-white',
    tasks: [
      { id: 1, title: 'Task 2', desc: 'Complete the user authentication module', priority: 'High' },
      {
        id: 2,
        title: 'Setup Database',
        desc: 'Configure PostgreSQL database connection',
        priority: 'Medium'
      }
    ]
  },
  {
    id: 2,
    name: 'In Progress',
    color: 'border-yellow-400',
    header: 'bg-yellow-50',
    tasks: [
      {
        id: 3,
        title: 'API Integration',
        desc: 'Integrate third-party payment gateway',
        priority: 'High'
      }
    ]
  },
  {
    id: 3,
    name: 'Review',
    color: 'border-blue-400',
    header: 'bg-blue-50',
    tasks: [
      {
        id: 4,
        title: 'Code Review',
        desc: 'Review pull request for new features',
        priority: 'Medium'
      }
    ]
  },
  {
    id: 4,
    name: 'Done',
    color: 'border-green-400',
    header: 'bg-green-50',
    tasks: [
      {
        id: 5,
        title: 'Landing Page',
        desc: 'Completed responsive landing page design',
        priority: 'Low'
      }
    ]
  }
]

function KanbanBoard() {
  const { theme } = useTheme ? useTheme() : { theme: 'light' }
  const [columns, setColumns] = useState(initialColumns)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')

  return (
    <div
      className={`px-12 pt-10 pb-4 w-full min-h-screen ${theme === 'dark' ? 'bg-[#18181B]' : 'bg-white'}`}
    >
      <h1
        className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}
      >
        Kanban Board
      </h1>
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title..."
          className={`w-full max-w-md px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-[#23232A] text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-[#23232A] text-gray-200' : 'border-gray-200 bg-white text-gray-700'} font-medium shadow-sm hover:bg-gray-100`}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option>All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div className="flex gap-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`flex-1 ${theme === 'dark' ? 'bg-[#23232A] border-gray-700' : 'bg-white'} rounded-2xl border ${col.color} shadow-sm p-4 min-w-[280px]`}
          >
            <div
              className={`flex items-center justify-between mb-4 ${theme === 'dark' ? '' : col.header} rounded-t-2xl px-2 pt-2 pb-3`}
            >
              <span
                className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {col.name}
              </span>
              <button className="bg-blue-600 text-white rounded-lg px-4 py-1 text-sm font-semibold flex items-center gap-1 hover:bg-blue-700">
                + Add
              </button>
            </div>
            {col.tasks
              .filter(
                (task) =>
                  (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
                  (priorityFilter === 'All priorities' || task.priority === priorityFilter)
              )
              .map((task) => (
                <div
                  key={task.id}
                  className={`rounded-xl border ${theme === 'dark' ? 'bg-[#23232A] border-gray-700' : 'bg-white border-gray-200'} shadow-sm p-4 mb-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {task.title}
                    </span>
                    <div className="flex gap-2">
                      <button className={`text-gray-400 hover:text-blue-600`}>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button className={`text-gray-400 hover:text-red-500`}>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {task.desc}
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${priorities.find((p) => p.label === task.priority)?.badge || ''}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
