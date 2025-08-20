import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../../../preload/index.d';

interface KanbanCardProps {
  card: Card;
  onCardClick: (card: Card) => void;
  isReadOnly?: boolean; // New prop for read-only mode
}

export default function KanbanCard({ card, onCardClick, isReadOnly = false }: KanbanCardProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'CARD', card },
    disabled: isReadOnly, // Disable sorting in read-only mode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isReadOnly ? undefined : transition, // Disable transition in read-only mode
    opacity: isDragging ? 0.5 : 1,
  };

  const cardClasses = isReadOnly 
    ? "bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-md p-3 mb-2 cursor-default"
    : "bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-md p-3 mb-2 cursor-pointer transition-colors duration-200 hover:bg-[var(--c-bg-4)]";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isReadOnly ? {} : attributes)} // Disable sortable attributes in read-only mode
      {...(isReadOnly ? {} : listeners)} // Disable sortable listeners in read-only mode
      className={cardClasses}
      onClick={() => onCardClick(card)}
    >
      {card.content}
    </div>
  );
}
