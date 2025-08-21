import { useState, useEffect } from 'react'
import { Board, Column, Card } from '../../types'
import { KanbanColumn } from './components/KanbanColumn'
import { CardDetailModal } from './components/CardDetailModal'
import { ErrorBoundary } from '../../components/ErrorBoundary'

interface BoardViewProps {
  board: Board
  onBack: () => void
  onUpdate: () => void
}

function BoardView({ board, onBack, onUpdate }: BoardViewProps): React.JSX.Element {
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (board.columns) {
      setColumns(board.columns)
    }
  }, [board])

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const handleAddCard = async (columnId: number, content: string) => {
    const result = await window.api.addCard(columnId, content)
    if (result.success && result.card) {
      setColumns(prevColumns => 
        prevColumns.map(col => 
          col.id === columnId 
            ? { ...col, cards: [...(col.cards || []), result.card] }
            : col
        )
      )
      onUpdate()
    }
  }

  const handleSaveCard = async (cardId: number, content: string) => {
    const result = await window.api.updateCard(cardId, content)
    if (result.success && result.card) {
      setColumns(prevColumns => 
        prevColumns.map(col => ({
          ...col,
          cards: (col.cards || []).map(card => 
            card.id === cardId ? result.card : card
          )
        }))
      )
      onUpdate()
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    const result = await window.api.deleteCard(cardId)
    if (result.success) {
      setColumns(prevColumns => 
        prevColumns.map(col => ({
          ...col,
          cards: (col.cards || []).filter(card => card.id !== cardId)
        }))
      )
      onUpdate()
    }
  }

  const handleMoveCard = async (cardId: number, fromColumnId: number, toColumnId: number) => {
    const result = await window.api.moveCard(cardId, toColumnId)
    if (result.success) {
      setColumns(prevColumns => {
        const fromColumn = prevColumns.find(col => col.id === fromColumnId)
        const toColumn = prevColumns.find(col => col.id === toColumnId)
        const card = fromColumn?.cards?.find(c => c.id === cardId)
        
        if (!fromColumn || !toColumn || !card) return prevColumns
        
        return prevColumns.map(col => {
          if (col.id === fromColumnId) {
            return { ...col, cards: (col.cards || []).filter(c => c.id !== cardId) }
          }
          if (col.id === toColumnId) {
            return { ...col, cards: [...(col.cards || []), card] }
          }
          return col
        })
      })
      onUpdate()
    }
  }

  return (
    <ErrorBoundary fallback={<div>Error loading board. Please go back and try again.</div>}>
      <div className="flex flex-col h-[calc(90vh-2rem)] p-4 box-border">
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <button onClick={onBack} className="bg-[var(--c-accent-1)] text-white border-none py-[10px] px-4 rounded-[5px] font-semibold cursor-pointer transition-opacity hover:opacity-90">← Back to Dashboard</button>
          <h2 className="text-[1.4rem] text-[var(--c-text-1)]">{board.name}</h2>
          <div />
        </div>
        
        <div className="flex gap-6 overflow-x-auto flex-grow pb-4">
          {columns.map((column) => (
            <ErrorBoundary key={column.id} fallback={<div>Error loading column: {column.name}</div>}>
              <KanbanColumn
                column={column}
                cards={column.cards || []}
                onCardClick={handleCardClick}
                onAddCard={(content) => handleAddCard(column.id, content)}
                onMoveCard={(cardId, toColumnId) => handleMoveCard(cardId, column.id, toColumnId)}
                isReadOnly={false}
              />
            </ErrorBoundary>
          ))}
        </div>
      </div>

      {isModalOpen && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCard(null)
          }}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </ErrorBoundary>
  )
}

export default BoardView
