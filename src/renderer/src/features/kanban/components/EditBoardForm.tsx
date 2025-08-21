import { useState } from 'react'
import { Board } from '../../../types'

interface EditBoardFormProps {
  board: Board
  onSubmit: (boardData: { name: string; description?: string }) => void
  onCancel: () => void
}

export function EditBoardForm({ board, onSubmit, onCancel }: EditBoardFormProps): React.JSX.Element {
  const [name, setName] = useState(board.name)
  const [description, setDescription] = useState(board.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() || undefined })
    }
  }

  return (
    <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Edit Board</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="boardName" className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
            Board Name *
          </label>
          <input
            id="boardName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)]"
            placeholder="Enter board name"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="boardDescription" className="block text-sm font-medium text-[var(--c-text-2)] mb-2">
            Description (optional)
          </label>
          <textarea
            id="boardDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] focus:outline-none focus:border-[var(--c-accent-1)] resize-none"
            placeholder="Enter board description"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90"
            disabled={!name.trim()}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[var(--c-bg-3)] text-[var(--c-text-2)] border-none py-2 px-4 rounded font-medium cursor-pointer hover:bg-[var(--c-bg-4)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
