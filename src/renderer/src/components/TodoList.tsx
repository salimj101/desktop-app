// src/renderer/src/components/TodoList.tsx
import { useState, useEffect } from 'react'
import { Todo } from '../../../preload/index.d' // Adjust the import path as necessary
import styles from './TodoList.module.css'

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
    <div className={styles.todoContainer}>
      <h3>My Todos</h3>
      <form onSubmit={handleAddTodo} className={styles.todoForm}>
        <input
          type="text"
          value={newTodoContent}
          onChange={(e) => setNewTodoContent(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.todoList}>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? styles.completed : ''}>
            <span onClick={() => handleToggleTodo(todo.id)}>{todo.content}</span>
            <button onClick={() => handleDeleteTodo(todo.id)} className={styles.deleteBtn}>
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList