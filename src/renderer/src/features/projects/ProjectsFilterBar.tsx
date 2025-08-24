import React from 'react'

const ProjectsFilterBar: React.FC = () => {
  return (
    <div className="flex gap-4 w-full">
      <input
        type="text"
        placeholder="Search projects..."
        className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 14.414V19a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
        All Status
      </button>
    </div>
  )
}

export default ProjectsFilterBar
