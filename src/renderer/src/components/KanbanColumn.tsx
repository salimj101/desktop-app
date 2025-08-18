import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column, Card } from '../../../preload/index.d';
import KanbanCard from './KanbanCard';
import styles from '../pages/BoardView.module.css';

const getColumnColor = (columnName: string) => {
  const name = columnName.toLowerCase();
  if (name.includes('progress')) return styles.progress;
  if (name.includes('done') || name.includes('completed')) return styles.done;
  if (name.includes('todo') || name.includes('backlog')) return styles.todo;
  return styles.default;
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
    <div className={`${styles.column} ${getColumnColor(column.name)}`}>
      <h3>{column.name}</h3>
      <div
        ref={setNodeRef}
        className={styles.cardsContainer}
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
          <div className={styles.addCardForm}>
            <textarea
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              placeholder="Enter card content..."
              autoFocus
            />
            <div>
              <button onClick={() => setAddingCard(false)}>Cancel</button>
              <button onClick={handleAddCard}>Add</button>
            </div>
          </div>
        ) : (
          <button className={styles.addCardBtn} onClick={() => setAddingCard(true)}>
            + Add Card
          </button>
        )
      )}
    </div>
  );
}
