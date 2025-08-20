// src/renderer/src/components/CardDetailModal.tsx
import { useState, useEffect } from 'react'
import { Card, Board } from '../../../preload/index.d'
import Modal from './Modal'

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
      <div className="bg-[var(--c-bg-1)] p-6 rounded-lg max-w-lg w-full mx-4">
        <h3 className="text-xl font-semibold text-[var(--c-text-1)] mb-2">Edit Card</h3>
        <p className="text-sm text-[var(--c-text-2)] mb-4">in list: <strong className="text-[var(--c-text-1)]">{currentColumn.name}</strong></p>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          className="w-full p-3 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] resize-none outline-none focus:border-[var(--c-accent-1)] transition-colors mb-4" 
          rows={8} 
        />
        
        <div className="mb-4">
          <label htmlFor="move-select" className="block text-sm font-medium text-[var(--c-text-1)] mb-2">Move to:</label>
          <select 
            id="move-select" 
            value={currentColumn.id} 
            onChange={handleMove}
            className="w-full p-2 bg-[var(--c-bg-2)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] outline-none focus:border-[var(--c-accent-1)] transition-colors"
          >
            {board.columns?.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onDelete(card.id)} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete Card
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export default CardDetailModal