import { useState } from 'react'
import { Column, Card } from '../../../types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  column: Column
  cards: Card[]
  onCardClick: (card: Card) => void
  onAddCard: (content: string) => void
  onMoveCard?: (cardId: number, toColumnId: number) => void
  isReadOnly?: boolean
}

export function KanbanColumn({
  column,
  cards,
  onCardClick,
  onAddCard,
  onMoveCard,
  isReadOnly = false
}: KanbanColumnProps): React.JSX.Element {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardContent, setNewCardContent] = useState('')

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCardContent.trim()) {
      onAddCard(newCardContent.trim())
      setNewCardContent('')
      setIsAddingCard(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const cardId = parseInt(e.dataTransfer.getData('text/plain'))
    if (cardId && onMoveCard) {
      onMoveCard(cardId, column.id)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div
      className="bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg p-4 min-w-[280px] max-w-[280px] flex flex-col"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h3 className="text-lg font-semibold text-[var(--c-text-1)] mb-4">{column.name}</h3>
      
      <div className="flex-grow space-y-3 mb-4">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>

      {!isReadOnly && (
        <div>
          {isAddingCard ? (
            <form onSubmit={handleAddCard} className="space-y-2">
              <textarea
                value={newCardContent}
                onChange={(e) => setNewCardContent(e.target.value)}
                placeholder="Enter card content..."
                className="w-full p-2 border border-[var(--c-border-1)] rounded text-sm resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[var(--c-accent-1)] text-white border-none py-1 px-3 rounded text-sm cursor-pointer hover:opacity-90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCard(false)
                    setNewCardContent('')
                  }}
                  className="bg-[var(--c-bg-3)] text-[var(--c-text-2)] border-none py-1 px-3 rounded text-sm cursor-pointer hover:bg-[var(--c-bg-4)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              className="w-full p-2 border-2 border-dashed border-[var(--c-border-2)] rounded text-[var(--c-text-2)] hover:border-[var(--c-accent-1)] hover:text-[var(--c-accent-1)] transition-colors"
            >
              + Add Card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
