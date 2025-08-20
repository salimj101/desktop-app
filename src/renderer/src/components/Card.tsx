// src/renderer/src/components/Card.tsx
import { useState } from 'react'
import { Card as CardType } from '../../../preload/index.d'

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
      <div className="bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded-lg p-4 shadow-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleUpdate}
          autoFocus
          className="w-full p-2 bg-[var(--c-bg-3)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] resize-none outline-none focus:border-[var(--c-accent-1)]"
        />
        <button onClick={handleUpdate} className="mt-2 px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] transition-colors">Save</button>
      </div>
    )
  }

  return (
    <div className="bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded-lg p-4 shadow-sm group hover:shadow-md transition-shadow">
      <p className="text-[var(--c-text-1)] mb-2">{card.content}</p>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="w-8 h-8 flex items-center justify-center text-[var(--c-text-2)] hover:text-[var(--c-accent-1)] hover:bg-[var(--c-bg-3)] rounded transition-colors">✎</button>
        <button onClick={() => onDelete(card.id)} className="w-8 h-8 flex items-center justify-center text-[var(--c-text-2)] hover:text-red-500 hover:bg-[var(--c-bg-3)] rounded transition-colors">🗑️</button>
      </div>
    </div>
  )
}
export default Card