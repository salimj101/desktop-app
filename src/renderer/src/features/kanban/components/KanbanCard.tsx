import { Card } from '../../../types'

interface KanbanCardProps {
  card: Card
  onClick: () => void
  isReadOnly?: boolean
}

export function KanbanCard({ card, onClick, isReadOnly = false }: KanbanCardProps): React.JSX.Element {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isReadOnly) {
      e.dataTransfer.setData('text/plain', card.id.toString())
    }
  }

  return (
    <div
      className={`bg-[var(--c-bg-3)] border border-[var(--c-border-1)] rounded p-3 cursor-pointer hover:bg-[var(--c-bg-4)] transition-colors ${
        isReadOnly ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={onClick}
      draggable={!isReadOnly}
      onDragStart={handleDragStart}
    >
      <p className="text-[var(--c-text-1)] text-sm whitespace-pre-wrap break-words">
        {card.content}
      </p>
      <div className="mt-2 text-xs text-[var(--c-text-2)]">
        {new Date(card.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
