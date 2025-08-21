import { useState } from 'react'
import { Card } from '../../../types'

interface CardDetailModalProps {
  card: Card
  isOpen: boolean
  onClose: () => void
  onSave: (cardId: number, content: string) => void
  onDelete: (cardId: number) => void
}

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete
}: CardDetailModalProps): React.JSX.Element {
  const [content, setContent] = useState(card.content)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onSave(card.id, content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-[var(--c-text-1)]">Card Details</h2>
          <button
            onClick={onClose}
            className="text-[var(--c-text-2)] hover:text-[var(--c-text-1)] text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--c-text-2)] mb-2">Content</label>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] bg-[var(--c-bg-2)] resize-none"
                rows={4}
                autoFocus
              />
            ) : (
              <div className="p-3 bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded text-[var(--c-text-1)] whitespace-pre-wrap">
                {card.content}
              </div>
            )}
          </div>

          <div className="text-sm text-[var(--c-text-2)]">
            <p>Created: {new Date(card.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(card.updatedAt).toLocaleString()}</p>
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setContent(card.content)
                    setIsEditing(false)
                  }}
                  className="bg-[var(--c-bg-3)] text-[var(--c-text-2)] border-none py-2 px-4 rounded font-medium cursor-pointer hover:bg-[var(--c-bg-4)]"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[var(--c-accent-1)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-[var(--c-danger)] text-white border-none py-2 px-4 rounded font-medium cursor-pointer hover:opacity-90"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
