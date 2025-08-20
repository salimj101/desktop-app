import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column, Card } from '../../../preload/index.d';
import KanbanCard from './KanbanCard';

const getColumnColor = (columnName: string) => {
  const name = columnName.toLowerCase();
  if (name.includes('progress')) return 'border-l-4 border-l-blue-500 bg-blue-50/10';
  if (name.includes('done') || name.includes('completed')) return 'border-l-4 border-l-green-500 bg-green-50/10';
  if (name.includes('todo') || name.includes('backlog')) return 'border-l-4 border-l-gray-500 bg-gray-50/10';
  return 'border-l-4 border-l-purple-500 bg-purple-50/10';
};

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: number, content: string) => void;
  isReadOnly?: boolean; // New prop for read-only mode
}

export function KanbanColumn({ 
  column, 
  cards = [], 
  onCardClick, 
  onAddCard, 
  isReadOnly = false 
}: KanbanColumnProps): React.JSX.Element {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'COLUMN', column },
    disabled: isReadOnly, // Disable droppable in read-only mode
  });

  const handleAddCard = () => {
    if (!newCardContent.trim()) return setAddingCard(false);
    onAddCard(column.id, newCardContent);
    setNewCardContent('');
    setAddingCard(false);
  };

  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div className={`bg-[var(--c-bg-2)] rounded-lg p-4 min-h-96 w-80 flex flex-col ${getColumnColor(column.name)}`}>
      <h3 className="font-semibold text-[var(--c-text-1)] mb-4 text-center">{column.name}</h3>
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-20"
        style={{ backgroundColor: isOver && !isReadOnly ? 'rgba(0, 0, 0, 0.1)' : undefined }}
      >
        <SortableContext
          items={safeCards.map((c) => `card-${c.id}`)}
          strategy={verticalListSortingStrategy}
          disabled={isReadOnly} // Disable sorting in read-only mode
        >
          {safeCards.map((card) => (
            <KanbanCard 
              key={card.id} 
              card={card} 
              onCardClick={onCardClick}
              isReadOnly={isReadOnly} // Pass read-only prop to card
            />
          ))}
        </SortableContext>
      </div>
      {!isReadOnly && (
        addingCard ? (
          <div className="mt-4 p-3 bg-[var(--c-bg-3)] rounded border border-[var(--c-border)]">
            <textarea
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              placeholder="Enter card content..."
              autoFocus
              className="w-full p-2 bg-[var(--c-bg-1)] border border-[var(--c-border)] rounded text-[var(--c-text-1)] resize-none outline-none focus:border-[var(--c-accent-1)] transition-colors mb-2"
              rows={3}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setAddingCard(false)}
                className="flex-1 px-3 py-2 bg-[var(--c-bg-2)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-1)] transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCard}
                className="flex-1 px-3 py-2 bg-[var(--c-accent-1)] text-white rounded hover:bg-[var(--c-accent-2)] transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="mt-4 w-full py-3 text-[var(--c-text-2)] border border-dashed border-[var(--c-border)] rounded hover:bg-[var(--c-bg-3)] hover:text-[var(--c-text-1)] transition-colors" 
            onClick={() => setAddingCard(true)}
          >
            + Add Card
          </button>
        )
      )}
    </div>
  );
}
