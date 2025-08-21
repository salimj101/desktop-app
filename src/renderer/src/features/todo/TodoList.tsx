// src/renderer/src/features/todo/TodoList.tsx
import { useState, useEffect } from 'react'
import { Todo } from '../../types'

function TodoList(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoContent, setNewTodoContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTodos = async (): Promise<void> => {
      const result = await window.api.getTodos()
      if (result.success && result.todos) {
        setTodos(result.todos)
      } else {
        setError(result.error || 'Failed to fetch todos.')
      }
    }
    fetchTodos()
  }, [])

  const handleAddTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newTodoContent.trim()) return

    const result = await window.api.addTodo(newTodoContent)
    if (result.success && result.todo) {
      setTodos([result.todo, ...todos])
      setNewTodoContent('')
    } else {
      setError(result.error || 'Failed to add todo.')
    }
  }

  const handleToggleTodo = async (id: number): Promise<void> => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    await window.api.toggleTodo(id) // Fire-and-forget in the background
  }

  const handleDeleteTodo = async (id: number): Promise<void> => {
    setTodos(todos.filter((t) => t.id !== id))
    await window.api.deleteTodo(id)
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-8 rounded-lg border border-[var(--c-border-1)]">
      <h3 className="text-center mb-6 text-[var(--c-text-1)] text-xl font-semibold">My Todos</h3>
      
      <form onSubmit={handleAddTodo} className="flex gap-2.5 mb-6">
        <input
          type="text"
          value={newTodoContent}
          onChange={(e) => setNewTodoContent(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-grow p-2.5 bg-[var(--c-bg-3)] border border-[var(--c-border-1)] rounded-md text-[var(--c-text-1)] placeholder:text-[var(--c-text-2)] focus:outline-none focus:ring-2 focus:ring-[var(--c-accent-1)] focus:border-transparent"
        />
        <button 
          type="submit"
          className="px-5 py-2.5 border-none bg-[var(--c-accent-1)] text-white rounded-md font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-90"
        >
          Add
        </button>
      </form>
      
      {error && <p className="text-[var(--c-danger)] text-center mb-4">{error}</p>}
      
      <ul className="list-none p-0 max-h-[50vh] overflow-y-auto pr-2.5">
        {todos.map((todo) => (
          <li 
            key={todo.id} 
            className="flex justify-between items-center p-4 border-b border-[var(--c-border-1)] transition-colors duration-200 hover:bg-[var(--c-bg-3)] group"
          >
            <span 
              onClick={() => handleToggleTodo(todo.id)}
              className={`cursor-pointer flex-grow text-[var(--c-text-1)] ${
                todo.completed ? 'line-through text-[var(--c-text-2)]' : ''
              }`}
            >
              {todo.content}
            </span>
            <button 
              onClick={() => handleDeleteTodo(todo.id)} 
              className="bg-none border-none text-[var(--c-danger)] text-2xl cursor-pointer px-2.5 py-0 opacity-50 transition-opacity duration-200 group-hover:opacity-100"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList
