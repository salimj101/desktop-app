import { useState, useEffect, useMemo, useCallback } from 'react';
import { Board, Card, Column } from '../../../preload/index.d';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/KanbanColumn';
import CardDetailModal from '../components/CardDetailModal';
import KanbanCard from '../components/KanbanCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { createPortal } from 'react-dom';
import debounce from 'lodash/debounce';

function BoardView({ boardId, onBack }: { boardId: number; onBack: () => void }): React.JSX.Element {
  const [board, setBoard] = useState<Board | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [cardToView, setCardToView] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchBoard = useCallback(
    debounce(async () => {
      setIsLoading(true);
      console.log('Fetching board:', { boardId });
      const res = await window.api.getBoardDetails(boardId);
      if (res.success && res.board) {
        const safeBoard = {
          ...res.board,
          columns: res.board.columns.map((col) => ({
            ...col,
            cards: Array.isArray(col.cards) ? col.cards : [],
          })),
        };
        setBoard(safeBoard);
        console.log('Board set:', {
          boardId,
          columns: safeBoard.columns.length,
          cards: safeBoard.columns.flatMap((c) => c.cards).length,
        });
      } else {
        console.error('Failed to fetch board:', res.error);
      }
      setIsLoading(false);
    }, 500),
    [boardId]
  );

  useEffect(() => {
    fetchBoard();
    return () => fetchBoard.cancel();
  }, [boardId, fetchBoard]);

  const handleAddCard = async (columnId: number, content: string) => {
    setIsLoading(true);
    const res = await window.api.createCard({ columnId, content });
    if (res.success) fetchBoard();
    else console.error('Failed to add card:', res.error);
    setIsLoading(false);
  };

  const handleSaveCard = async (cardId: number, content: string) => {
    setIsLoading(true);
    const res = await window.api.updateCardContent({ cardId, content });
    if (res.success) {
      setCardToView(null);
      fetchBoard();
    } else console.error('Failed to update card:', res.error);
    setIsLoading(false);
  };

  const handleDeleteCard = async (cardId: number) => {
    if (confirm('Delete card?')) {
      setIsLoading(true);
      const res = await window.api.deleteCard(cardId);
      if (res.success) {
        setCardToView(null);
        fetchBoard();
      } else console.error('Failed to delete card:', res.error);
      setIsLoading(false);
    }
  };

  const handleMoveCardFromModal = async (cardId: number, newColumnId: number) => {
    const targetCol = board?.columns?.find((c) => c.id === newColumnId);
    if (!targetCol) return;
    setIsLoading(true);
    const res = await window.api.moveCard({ cardId, newColumnId, newOrder: targetCol.cards.length });
    if (res.success) {
      setCardToView(null);
      fetchBoard();
    } else console.error('Failed to move card from modal:', res.error);
    setIsLoading(false);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const columnsMap = useMemo(() => {
    if (!board) return new Map<number, Column>();
    return new Map(board.columns.map((col) => [col.id, col]));
  }, [board]);

  const onDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', {
      id: event.active.id,
      type: event.active.data.current?.type,
      cardId: event.active.data.current?.card?.id,
      columnId: event.active.data.current?.card?.columnId,
    });
    if (event.active.data.current?.type === 'CARD') {
      setActiveCard(event.active.data.current.card);
      setIsDragging(true);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    console.log('Drag ended:', {
      active: {
        id: event.active.id,
        type: event.active.data.current?.type,
        cardId: event.active.data.current?.card?.id,
        columnId: event.active.data.current?.card?.columnId,
      },
      over: {
        id: event.over?.id,
        type: event.over?.data.current?.type,
        cardId: event.over?.data.current?.card?.id,
        columnId:
          event.over?.data.current?.type === 'COLUMN'
            ? event.over?.data.current?.column?.id
            : event.over?.data.current?.card?.columnId,
      },
    });
    setActiveCard(null);
    setIsDragging(false);
    const { active, over } = event;
    if (!over || !board || isLoading) {
      console.log('No over, no board, or loading, aborting drag');
      return;
    }

    const activeId = active.data.current?.card?.id;
    const activeColumnId = active.data.current?.card?.columnId;
    if (!activeId || activeColumnId === undefined) {
      console.log('Invalid active card or column, aborting drag');
      return;
    }

    const overType = over.data.current?.type;
    let overColumnId: number | undefined;
    let overIndex: number;

    if (overType === 'CARD') {
      const overCard = over.data.current?.card;
      if (activeId === overCard?.id) {
        console.log('Same card ID, aborting drag');
        return;
      }
      overColumnId = overCard?.columnId;
      overIndex = columnsMap.get(overColumnId)?.cards.findIndex((c) => c.id === overCard.id) ?? -1;
    } else if (overType === 'COLUMN') {
      overColumnId = over.data.current?.column?.id;
      overIndex = columnsMap.get(overColumnId)?.cards.length ?? 0;
    } else {
      console.log('Invalid over type, aborting drag');
      return;
    }

    if (overColumnId === undefined || overIndex < 0) {
      console.log('Invalid over column or index, aborting drag');
      return;
    }

    console.log('Moving card:', { activeId, activeColumnId, overColumnId, overIndex });

    const originalBoard = { ...board, columns: board.columns.map((c) => ({ ...c, cards: [...(c.cards || [])] })) };

    setBoard((prevBoard) => {
      if (!prevBoard || isLoading) return prevBoard;
      console.log('Optimistic update, current board:', {
        columns: prevBoard.columns.map((c) => ({ id: c.id, cards: (c.cards || []).map(card => card.id) })),
      });
      const newColumns = prevBoard.columns.map((c) => ({ ...c, cards: Array.isArray(c.cards) ? [...c.cards] : [] }));
      const activeColumn = newColumns.find((c) => c.id === activeColumnId);
      const overColumn = newColumns.find((c) => c.id === overColumnId);
      if (!activeColumn || !overColumn) {
        console.error('Invalid columns for update:', { activeColumnId, overColumnId });
        return prevBoard;
      }

      const activeIndex = activeColumn.cards.findIndex((c) => c.id === activeId);
      if (activeIndex < 0) {
        console.error('Invalid activeIndex:', { activeId, activeColumnId, columnCards: activeColumn.cards.map(c => c.id) });
        return prevBoard;
      }

      if (activeColumnId === overColumnId) {
        activeColumn.cards = arrayMove(activeColumn.cards, activeIndex, overIndex);
      } else {
        const [movedItem] = activeColumn.cards.splice(activeIndex, 1);
        overColumn.cards.splice(overIndex, 0, movedItem);
      }
      console.log('Updated board:', {
        columns: newColumns.map((c) => ({ id: c.id, cards: c.cards.map(card => card.id) })),
      });
      return { ...prevBoard, columns: newColumns };
    });

    try {
      const res = await window.api.moveCard({
        cardId: activeId,
        newColumnId: overColumnId,
        newOrder: overIndex,
      });
      if (!res.success) {
        console.error('Backend move failed:', res.error);
        setBoard(originalBoard);
        fetchBoard();
      } else {
        // Fetch to sync after success, but debounced
        fetchBoard();
      }
    } catch (error) {
      console.error('Failed to move card:', error);
      setBoard(originalBoard);
      fetchBoard();
    }
  };

  if (!board || isLoading) return <div>Loading board...</div>;

  return (
    <>
      <div className="flex flex-col h-screen bg-[var(--c-bg-1)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--c-border)] bg-[var(--c-bg-2)]">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[var(--c-bg-3)] text-[var(--c-text-1)] border border-[var(--c-border)] rounded hover:bg-[var(--c-bg-2)] transition-colors"
          >
            ← Back to Boards
          </button>
          <h2 className="text-xl font-semibold text-[var(--c-text-1)]">{board.name}</h2>
          <div />
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex-1 flex gap-6 p-6 overflow-x-auto">
            {board.columns?.map((column) => (
              <ErrorBoundary key={column.id} fallback={<div>Error loading column: {column.name}</div>}>
                <KanbanColumn
                  column={column}
                  cards={column.cards || []}
                  onCardClick={setCardToView}
                  onAddCard={handleAddCard}
                />
              </ErrorBoundary>
            ))}
          </div>
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {activeCard && !isLoading ? <KanbanCard card={activeCard} onCardClick={() => {}} /> : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
      <CardDetailModal
        card={cardToView}
        board={board}
        onClose={() => setCardToView(null)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onMove={handleMoveCardFromModal}
      />
    </>
  );
}

export default BoardView;