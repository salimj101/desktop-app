// src/renderer/src/components/CreateBoardForm.tsx
import { useState } from 'react'
import styles from './CreateBoardForm.module.css'

interface CreateBoardFormProps {
  onSubmit: (data: { name: string; visibility: 'private' | 'public'; columns: string[] }) => void
  onCancel: () => void
}

function CreateBoardForm({ onSubmit, onCancel }: CreateBoardFormProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert('Board name is required.')
    onSubmit({ name, visibility, columns: ['To Do', 'In Progress', 'Done'] })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Create New Kanban Board</h2>
      <div className={styles.formGroup}>
        <label htmlFor="boardName">Board Name</label>
        <input id="boardName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Project Phoenix" autoFocus />
      </div>
      <div className={styles.formGroup}>
        <label>Visibility</label>
        <div className={styles.radioGroup}>
          <label><input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} /> Private</label>
          <label><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} /> Public</label>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>Create Board</button>
      </div>
    </form>
  )
}
export default CreateBoardForm