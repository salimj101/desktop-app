import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

type Priority = "Low" | "Medium" | "High"
type Status = "To Do" | "In Progress" | "Review" | "Done"

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  boardId?: string
}

interface Board {
  id: string
  name: string
  description?: string
  isPublic: boolean
  columns: Column[]
}

interface Column {
  id: string
  name: string
  order: number
  cards: Task[]
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Task 2",
    description: "Complete the user authentication module",
    priority: "High",
    status: "To Do",
  },
  {
    id: "2",
    title: "Setup Database",
    description: "Configure PostgreSQL database connection",
    priority: "Medium",
    status: "To Do",
  },
  {
    id: "3",
    title: "API Integration",
    description: "Integrate third-party payment gateway",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "4",
    title: "Code Review",
    description: "Review pull request for new features",
    priority: "Medium",
    status: "Review",
  },
  {
    id: "5",
    title: "Landing Page",
    description: "Completed responsive landing page design",
    priority: "Low",
    status: "Done",
  },
]

const columns: Status[] = ["To Do", "In Progress", "Review", "Done"]

const priorityColors = {
  Low: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
  Medium: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
  High: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
}

const columnColors = {
  "To Do": "border-t-gray-400 dark:border-t-gray-500",
  "In Progress": "border-t-yellow-400 dark:border-t-yellow-500",
  Review: "border-t-blue-400 dark:border-t-blue-500",
  Done: "border-t-green-400 dark:border-t-green-500",
}

export default function KanbanBoard() {
  const { isDark } = useTheme()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addingToColumn, setAddingToColumn] = useState<Status>("To Do")
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All")
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as Priority,
  })

  const [boardFormData, setBoardFormData] = useState({
    name: "",
    visibility: "private" as "private" | "public",
    columns: ["To Do", "In Progress", "Review", "Done"]
  })

  // Fetch boards on component mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true)
        const result = await (window.api as any).getBoards?.()
        if (result && result.success) {
          setBoards(result.data || [])
          if (result.data && result.data.length > 0) {
            setSelectedBoard(result.data[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch boards:', error)
        toast.error('Failed to fetch boards')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoards()
  }, [])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    if (draggedTask) {
      try {
        // Update local state immediately for better UX
        setTasks((prev) => prev.map((task) => 
          task.id === draggedTask.id ? { ...task, status } : task
        ))
        
        // Call the moveCard API
        if (selectedBoard) {
          const result = await (window.api as any).moveCard?.({
            cardId: draggedTask.id,
            newColumnId: status,
            boardId: selectedBoard.id
          })
          
          if (!result?.success) {
            // Revert if API call failed
            setTasks((prev) => prev.map((task) => 
              task.id === draggedTask.id ? { ...task, status: draggedTask.status } : task
            ))
            toast.error('Failed to move card')
          } else {
            toast.success('Card moved successfully')
          }
        }
        
        setDraggedTask(null)
      } catch (error) {
        console.error('Failed to move card:', error)
        toast.error('Failed to move card')
        // Revert on error
        setTasks((prev) => prev.map((task) => 
          task.id === draggedTask.id ? { ...task, status: draggedTask.status } : task
        ))
        setDraggedTask(null)
      }
    }
  }

  const handleAddTask = async () => {
    if (formData.title.trim() && selectedBoard) {
      try {
        const newTask: Task = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: addingToColumn,
          boardId: selectedBoard.id
        }

        // Call the createCard API
        const result = await (window.api as any).createCard?.({
          boardId: selectedBoard.id,
          columnId: addingToColumn,
          title: formData.title,
          description: formData.description,
          priority: formData.priority
        })

        if (result?.success) {
          setTasks((prev) => [...prev, newTask])
          setFormData({ title: "", description: "", priority: "Medium" })
          setIsAddDialogOpen(false)
          toast.success('Task created successfully')
        } else {
          toast.error('Failed to create task')
        }
      } catch (error) {
        console.error('Failed to create task:', error)
        toast.error('Failed to create task')
      }
    }
  }

  const handleEditTask = async () => {
    if (editingTask && formData.title.trim()) {
      try {
        // Call the updateCardContent API
        const result = await (window.api as any).updateCardContent?.({
          cardId: editingTask.id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority
        })

        if (result?.success) {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === editingTask.id
                ? { ...task, title: formData.title, description: formData.description, priority: formData.priority }
                : task,
            ),
          )
          setEditingTask(null)
          setFormData({ title: "", description: "", priority: "Medium" })
          toast.success('Task updated successfully')
        } else {
          toast.error('Failed to update task')
        }
      } catch (error) {
        console.error('Failed to update task:', error)
        toast.error('Failed to update task')
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await (window.api as any).deleteCard?.(taskId)
      if (result?.success) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
        toast.success('Task deleted successfully')
      } else {
        toast.error('Failed to delete task')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const openAddDialog = (status: Status) => {
    setAddingToColumn(status)
    setFormData({ title: "", description: "", priority: "Medium" })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
    })
  }

  const getTasksByStatus = (status: Status) => {
    return tasks.filter((task) => {
      const matchesStatus = task.status === status
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter

      return matchesStatus && matchesSearch && matchesPriority
    })
  }

  const handleCreateBoard = async () => {
    if (!boardFormData.name.trim()) {
      toast.error('Board name is required')
      return
    }

    try {
      setIsCreatingBoard(true)
      const result = await (window.api as any).createBoard?.({
        name: boardFormData.name.trim(),
        visibility: boardFormData.visibility,
        columns: boardFormData.columns
      })

      if (result?.success) {
        toast.success('Board created successfully!')
        setIsCreateBoardOpen(false)
        setBoardFormData({
          name: "",
          visibility: "private",
          columns: ["To Do", "In Progress", "Review", "Done"]
        })
        
        // Refresh the boards list
        const boardsResult = await (window.api as any).getBoards?.()
        if (boardsResult && boardsResult.success) {
          setBoards(boardsResult.boards || [])
          // Select the newly created board
          if (result.board) {
            setSelectedBoard(result.board)
          }
        }
      } else {
        toast.error(result?.error || 'Failed to create board')
      }
    } catch (error) {
      console.error('Failed to create board:', error)
      toast.error('Failed to create board')
    } finally {
      setIsCreatingBoard(false)
    }
  }

  const openCreateBoardDialog = () => {
    setBoardFormData({
      name: "",
      visibility: "private",
      columns: ["To Do", "In Progress", "Review", "Done"]
    })
    setIsCreateBoardOpen(true)
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="p-6">
          <div className="text-center">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading Kanban boards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <main className="flex-1 p-6">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Kanban Boards</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your project tasks and workflows
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openCreateBoardDialog}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
          </div>
        </div>

        {/* Board Selection */}
        {boards.length > 0 ? (
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Board
            </label>
            <select
              value={selectedBoard?.id || ''}
              onChange={(e) => {
                const board = boards.find(b => b.id === e.target.value)
                setSelectedBoard(board || null)
              }}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={`mb-6 p-4 rounded-lg border-2 border-dashed transition-colors duration-300 ${
            isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-center">
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No boards available. Create your first board to get started!
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {boards.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | "All")}
                className={`appearance-none border-2 rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="All">All priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {boards.length > 0 && selectedBoard ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div
                key={column}
                className={`rounded-xl p-4 border-t-4 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } ${columnColors[column]}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-semibold text-lg transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{column}</h2>
                  <button
                    onClick={() => openAddDialog(column)}
                    className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {getTasksByStatus(column).map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-lg border p-4 cursor-move hover:shadow-md transition-all duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                          : 'bg-gray-50 border-gray-200 hover:bg-white'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium text-sm transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{task.title}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditDialog(task)}
                            className={`h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors duration-300 ${
                              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center justify-center transition-colors duration-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs mb-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{task.description}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className={`text-center p-12 rounded-lg transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <div className="mb-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
              }`}>
                <Plus className="w-8 h-8" />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>No Boards Yet</h3>
            <p className={`mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your first Kanban board to start organizing tasks and workflows.
            </p>
            <button
              onClick={openCreateBoardDialog}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className={`text-center p-12 rounded-lg transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Select a Board</h3>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Choose a board from the dropdown above to view and manage tasks.
            </p>
          </div>
        )}

        {/* Create Board Modal */}
        {isCreateBoardOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-xl p-6 w-96 max-w-md mx-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Create New Board</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Board Name</label>
                  <input
                    type="text"
                    value={boardFormData.name}
                    onChange={(e) => setBoardFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter board name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Visibility</label>
                  <select
                    value={boardFormData.visibility}
                    onChange={(e) => setBoardFormData((prev) => ({ 
                      ...prev, 
                      visibility: e.target.value as "private" | "public" 
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Default Columns</label>
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      To Do, In Progress, Review, Done
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      (Default columns will be created automatically)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsCreateBoardOpen(false)}
                    disabled={isCreatingBoard}
                    className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBoard}
                    disabled={isCreatingBoard || !boardFormData.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isCreatingBoard ? 'Creating...' : 'Create Board'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-xl p-6 w-96 max-w-md mx-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Add New Task to {addingToColumn}</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddDialogOpen(false)}
                    className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-xl p-6 w-96 max-w-md mx-4 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Edit Task</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingTask(null)}
                    className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
