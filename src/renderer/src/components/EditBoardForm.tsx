// src/renderer/src/components/EditBoardForm.tsx
import { useState, useEffect } from 'react'
import { Board } from '../../../preload/index.d'
import styles from './CreateBoardForm.module.css' // Reuse styles

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Edit Board</h2>
      <div className={styles.formGroup}><label htmlFor="boardName">Board Name</label><input id="boardName" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
      <div className={styles.formGroup}><label>Visibility</label><div className={styles.radioGroup}><label><input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} /> Private</label><label><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} /> Public</label></div></div>
      <div className={styles.buttonGroup}><button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button><button type="submit" className={styles.submitBtn}>Save Changes</button></div>
    </form>
  )
}
export default EditBoardForm