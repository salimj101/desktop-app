// src/renderer/src/components/EditBoardForm.tsx
import { useState, useEffect } from 'react'
import { Board } from '../../../preload/index.d'

interface EditBoardFormProps {
  board: Board
  onSubmit: (data: { boardId: number; name: string; visibility: 'private' | 'public' }) => void
  onCancel: () => void
}

function EditBoardForm({ board, onSubmit, onCancel }: EditBoardFormProps): React.JSX.Element {
  const [name, setName] = useState(board.name)
  const [visibility, setVisibility] = useState<'private' | 'public'>(board.visibility)

  useEffect(() => {
    setName(board.name)
    setVisibility(board.visibility)
  }, [board])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert('Board name is required.')
    onSubmit({ boardId: board.id, name, visibility })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-[var(--c-text-1)] mb-4">Edit Board</h2>
      <div className="space-y-2">
        <label htmlFor="boardName" className="block text-sm font-medium text-[var(--c-text-1)]">Board Name</label>
        <input 
          id="boardName" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          autoFocus 
          className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none focus:border-[var(--c-accent-1)] transition-colors"
        />
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--c-text-1)]">Visibility</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-[var(--c-text-1)] cursor-pointer">
            <input 
              type="radio" 
              name="visibility" 
              value="private" 
              checked={visibility === 'private'} 
              onChange={() => setVisibility('private')} 
              className="text-[var(--c-accent-1)]"
            /> 
            Private
          </label>
          <label className="flex items-center gap-2 text-[var(--c-text-1)] cursor-pointer">
            <input 
              type="radio" 
              name="visibility" 
              value="public" 
              checked={visibility === 'public'} 
              onChange={() => setVisibility('public')} 
              className="text-[var(--c-accent-1)]"
            /> 
            Public
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="flex-1 px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
export default EditBoardForm