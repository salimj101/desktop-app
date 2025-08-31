import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, Edit3, Trash2 } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

type Priority = 'Low' | 'Medium' | 'High'
type Status = 'To Do' | 'In Progress' | 'Review' | 'Done'

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
    id: 'demo-1',
    title: 'Welcome',
    description: 'This is a demo task. Edit or remove it to get started.',
    priority: 'Medium',
    status: 'To Do'
  }
]

const columns: Status[] = ['To Do', 'In Progress', 'Review', 'Done']

const priorityColors = {
  Low: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
  Medium:
    'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
  High: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700'
}

const columnColors = {
  'To Do': 'border-t-gray-400 dark:border-t-gray-500',
  'In Progress': 'border-t-yellow-400 dark:border-t-yellow-500',
  Review: 'border-t-blue-400 dark:border-t-blue-500',
  Done: 'border-t-green-400 dark:border-t-green-500'
}

export default function KanbanBoard() {
  const { isDark } = useTheme()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addingToColumn, setAddingToColumn] = useState<Status>('To Do')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [boardColumns, setBoardColumns] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Priority
  })

  // board creation has been removed from the UI; boards are read-only here

  // Fetch boards on component mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true)
        const result = await (window.api as any).getBoards?.()
        if (result && result.success) {
          const fetched = result.boards || []
          setBoards(fetched)
          if (fetched.length > 0) setSelectedBoard(fetched[0])
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

  // Load board details (columns + cards) when a board is selected
  useEffect(() => {
    const loadBoardDetails = async () => {
      if (!selectedBoard) {
        setBoardColumns([])
        return
      }

      try {
        setIsLoading(true)
        const res = await (window.api as any).getBoardDetails?.(Number(selectedBoard.id))
        if (res && res.success && res.board) {
          const board = res.board as any
          const cols = board.columns || []
          setBoardColumns(cols.map((c: any) => ({ id: c.id, name: c.name })))

          // Flatten cards into tasks
          const cards: Task[] = []
          for (const col of cols) {
            const colName = col.name as Status
            const colCards = col.cards || []
            for (const card of colCards) {
              cards.push({
                id: String(card.id),
                title: String(card.content || '').split('\n')[0] || 'Card',
                description: String(card.content || ''),
                priority: 'Medium',
                status: colName,
                boardId: String(board.id)
              })
            }
          }
          setTasks(cards)
        }
      } catch (error) {
        console.error('Failed to load board details:', error)
        toast.error('Failed to load board details')
      } finally {
        setIsLoading(false)
      }
    }

    loadBoardDetails()
  }, [selectedBoard])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    if (draggedTask) {
      try {
        // Update local state immediately for better UX
        setTasks((prev) =>
          prev.map((task) => (task.id === draggedTask.id ? { ...task, status } : task))
        )

        // Call the moveCard API (use numeric card id and column id)
        if (selectedBoard) {
          try {
            const col = boardColumns.find((c) => c.name === status)
            const cardIdNum = Number(draggedTask.id)
            if (col && !Number.isNaN(cardIdNum)) {
              // place at end of column for now
              const newOrder = getTasksByStatus(status).length
              const result = await (window.api as any).moveCard?.({
                cardId: cardIdNum,
                newColumnId: col.id,
                newOrder
              })

              if (!result?.success) {
                // Revert if API call failed
                setTasks((prev) =>
                  prev.map((task) =>
                    task.id === draggedTask.id ? { ...task, status: draggedTask.status } : task
                  )
                )
                toast.error('Failed to move card')
              } else {
                toast.success('Card moved successfully')
              }
            }
          } catch (err) {
            console.error('moveCard IPC failed:', err)
            setTasks((prev) =>
              prev.map((task) =>
                task.id === draggedTask.id ? { ...task, status: draggedTask.status } : task
              )
            )
            toast.error('Failed to move card')
          }
        }

        setDraggedTask(null)
      } catch (error) {
        console.error('Failed to move card:', error)
        toast.error('Failed to move card')
        // Revert on error
        setTasks((prev) =>
          prev.map((task) =>
            task.id === draggedTask.id ? { ...task, status: draggedTask.status } : task
          )
        )
        setDraggedTask(null)
      }
    }
  }

  const handleAddTask = async () => {
    if (!formData.title.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: addingToColumn,
      boardId: selectedBoard?.id
    }

    // Optimistically update UI
    setTasks((prev) => [...prev, newTask])
    setFormData({ title: '', description: '', priority: 'Medium' })
    setIsAddDialogOpen(false)
    toast.success('Task created')

    // Persist if there's a selected board and matching column id
    if (selectedBoard) {
      try {
        const col = boardColumns.find((c) => c.name === addingToColumn)
        if (col) {
          const content = `${newTask.title}\n\n${newTask.description}`
          const result = await (window.api as any).createCard?.({ columnId: col.id, content })
          if (!result?.success) {
            toast.error('Failed to persist task to server')
          } else {
            // replace optimistic task id with server id if returned
            const serverCard = result.result
            if (serverCard && serverCard.id) {
              setTasks((prev) =>
                prev.map((t) => (t.id === newTask.id ? { ...t, id: String(serverCard.id) } : t))
              )
            }
          }
        }
      } catch (error) {
        console.error('Failed to persist task:', error)
        toast.error('Failed to persist task')
      }
    }
  }

  const handleEditTask = async () => {
    if (!(editingTask && formData.title.trim())) return

    const updatedValues = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority
    }

    // Optimistic local update
    setTasks((prev) =>
      prev.map((task) => (task.id === editingTask.id ? { ...task, ...updatedValues } : task))
    )

    const original = editingTask
    setEditingTask(null)
    setFormData({ title: '', description: '', priority: 'Medium' })
    toast.success('Task updated')

    // Persist if the task belongs to a board
    if (original.boardId) {
      try {
        const content = `${updatedValues.title}\n\n${updatedValues.description}`
        const result = await (window.api as any).updateCardContent?.({
          cardId: Number(original.id),
          content
        })
        if (!result?.success) {
          toast.error('Failed to persist task update')
        }
      } catch (error) {
        console.error('Failed to persist task update:', error)
        toast.error('Failed to persist task update')
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    // Optimistically remove locally
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    toast.success('Task removed')

    try {
      const result = await (window.api as any).deleteCard?.(Number(taskId))
      if (!result?.success) {
        toast.error('Failed to delete task on server')
      }
    } catch (error) {
      console.error('Failed to delete task on server:', error)
      toast.error('Failed to delete task on server')
    }
  }

  const openAddDialog = (status: Status) => {
    setAddingToColumn(status)
    setFormData({ title: '', description: '', priority: 'Medium' })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority
    })
  }

  const getTasksByStatus = (status: Status) => {
    return tasks.filter((task) => {
      const matchesStatus = task.status === status
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter

      return matchesStatus && matchesSearch && matchesPriority
    })
  }

  // create-board handlers removed

  if (isLoading) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="p-6">
          <div className="text-center">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading Kanban boards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <main className="flex-1 p-6">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Kanban Boards
            </h1>
            <p
              className={`text-lg transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Manage your project tasks and workflows
            </p>
          </div>
          <div className="flex space-x-3">{/* Create board action intentionally removed */}</div>
        </div>

        {/* Board Selection
        {boards.length > 0 ? (
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Select Board
            </label>
            <select
              value={selectedBoard?.id || ''}
              onChange={(e) => {
                const board = boards.find((b) => b.id === e.target.value)
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
          <div
            className={`mb-6 p-4 rounded-lg border-2 border-dashed transition-colors duration-300 ${
              isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="text-center">
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                No boards available.
              </p>
            </div>
          </div>
        )} */}

        {/* Search and Filters */}
        {(boards.length > 0 || tasks.length > 0) && (
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
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
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
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
              <Filter
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {selectedBoard || tasks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div
                key={column}
                className={`rounded-xl p-4 border-t-4 transition-colors duration-300 ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${columnColors[column]}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`font-semibold text-lg transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {column}
                  </h2>
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
                        <h3
                          className={`font-medium text-sm transition-colors duration-300 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditDialog(task)}
                            className={`h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors duration-300 ${
                              isDark
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-500 hover:text-gray-700'
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
                      <p
                        className={`text-xs mb-2 transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {task.description}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`text-center p-12 rounded-lg transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              Select a Board
            </h3>
            <p
              className={`transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Choose a board from the dropdown above to view and manage tasks.
            </p>
          </div>
        )}

        {/* Add Task Modal */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`rounded-xl p-6 w-96 max-w-md mx-4 transition-colors duration-300 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <h2
                className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Add New Task to {addingToColumn}
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Title
                  </label>
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
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
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
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))
                    }
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
            <div
              className={`rounded-xl p-6 w-96 max-w-md mx-4 transition-colors duration-300 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <h2
                className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Edit Task
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Title
                  </label>
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
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
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
                  <label
                    className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))
                    }
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
