import { ShieldCheck, AlertTriangle, XCircle, GitCompare } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function RepoHealthPage() {
  const { isDark } = useTheme()
  const stats = [
    {
      value: 0,
      label: 'Healthy',
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      color: 'text-green-500'
    },
    {
      value: 0,
      label: 'Warnings',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
      color: 'text-yellow-500'
    },
    {
      value: 4,
      label: 'Issues',
      icon: <XCircle className="w-8 h-8 text-red-500" />,
      color: 'text-red-500'
    },
    {
      value: 4,
      label: 'Total Repos',
      icon: <GitCompare className="w-8 h-8 text-blue-500" />,
      color: 'text-blue-500'
    }
  ]

  const issues = [
    {
      name: 'a2sv-project',
      path: 'D:\\Projects\\a2sv-project',
      problems: ['Repository not found locally', 'Unable to sync with remote']
    },
    {
      name: 'a2sv-starter--project-g69',
      path: 'E:\\a2sv-starter--project-g69',
      problems: ['Repository not found locally', 'Unable to sync with remote']
    }
  ]

  return (
    <div
      className={`p-6 h-full transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Repository Health
      </h1>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        Monitor and maintain your repository health status
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-sm flex items-center space-x-4 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {stat.icon}
            <div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {issue.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {issue.path}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                }`}
              >
                Missing Local
              </span>
            </div>
            <div>
              <h4
                className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              >
                Issues Found:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {issue.problems.map((problem, i) => (
                  <li
                    key={i}
                    className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                  >
                    {problem}
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Setup Repository
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
