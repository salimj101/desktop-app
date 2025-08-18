// src/renderer/src/components/CardDetailModal.tsx
import { useState, useEffect } from 'react'
import { Card, Board } from '../../../preload/index.d'
import Modal from './Modal'
import styles from './CardDetailModal.module.css'

interface CardDetailModalProps {
  card: Card | null
  board: Board | null
  onClose: () => void
  onSave: (cardId: number, newContent: string) => void
  onDelete: (cardId: number) => void
  onMove: (cardId: number, newColumnId: number) => void
}

function CardDetailModal({ card, board, onClose, onSave, onDelete, onMove }: CardDetailModalProps): React.JSX.Element | null {
  const [content, setContent] = useState('')
  
  const currentColumn = board?.columns?.find(c => c.id === card?.columnId)

  useEffect(() => { setContent(card?.content || '') }, [card])

  if (!card || !board || !currentColumn) return null

  const handleSave = () => { if (content.trim()) onSave(card.id, content) }
  const handleMove = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newColumnId = parseInt(e.target.value)
    onMove(card.id, newColumnId)
  }

  return (
    <Modal isOpen={!!card} onClose={onClose}>
      <div className={styles.container}>
        <h3>Edit Card</h3>
        <p className={styles.columnInfo}>in list: <strong>{currentColumn.name}</strong></p>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className={styles.textarea} rows={8} />
        
        <div className={styles.moveSection}>
          <label htmlFor="move-select">Move to:</label>
          <select id="move-select" value={currentColumn.id} onChange={handleMove}>
            {board.columns.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.buttonGroup}>
          <button onClick={() => onDelete(card.id)} className={styles.deleteBtn}>Delete Card</button>
          <div>
            <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button onClick={handleSave} className={styles.saveBtn}>Save</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export default CardDetailModal