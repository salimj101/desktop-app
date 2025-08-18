// src/renderer/src/components/Card.tsx
import { useState } from 'react'
import { Card as CardType } from '../../../preload/index.d'
import styles from './Card.module.css'

interface CardProps {
  card: CardType
  onUpdate: (cardId: number, content: string) => void
  onDelete: (cardId: number) => void
}

function Card({ card, onUpdate, onDelete }: CardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(card.content)

  const handleUpdate = () => {
    if (content.trim() && content !== card.content) {
      onUpdate(card.id, content)
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={styles.card}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleUpdate}
          autoFocus
          className={styles.editor}
        />
        <button onClick={handleUpdate} className={styles.saveBtn}>Save</button>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <p>{card.content}</p>
      <div className={styles.actions}>
        <button onClick={() => setIsEditing(true)} className={styles.actionBtn}>✎</button>
        <button onClick={() => onDelete(card.id)} className={styles.actionBtn}>🗑️</button>
      </div>
    </div>
  )
}
export default Card