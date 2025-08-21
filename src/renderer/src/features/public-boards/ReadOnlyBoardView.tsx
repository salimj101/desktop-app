import { useState, useEffect } from 'react';
import { Board } from '../../types';
import { KanbanColumn } from '../kanban/components/KanbanColumn';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface ReadOnlyBoardViewProps {
  boardId: number;
  onBack: () => void;
}

function ReadOnlyBoardView({ boardId, onBack }: ReadOnlyBoardViewProps): React.JSX.Element {
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      const res = await window.api.getBoardDetails(boardId);
      if (res.success && res.board) {
        const safeBoard = {
          ...res.board,
          columns: res.board.columns?.map((col) => ({
            ...col,
            cards: Array.isArray(col.cards) ? col.cards : [],
          })) || [],
        };
        setBoard(safeBoard);
      }
      setIsLoading(false);
    };
    fetchBoard();
  }, [boardId]);

  if (!board || isLoading) return <div>Loading board...</div>;

  return (
    <ErrorBoundary fallback={<div>Error loading board. Please go back and try again.</div>}>
      <div className="flex flex-col h-[calc(90vh-2rem)] p-4 box-border">
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <button onClick={onBack} className="bg-[var(--c-accent-1)] text-white border-none py-[10px] px-4 rounded-[5px] font-semibold cursor-pointer transition-opacity hover:opacity-90">← Back to Public Boards</button>
          <h2 className="text-[1.4rem] text-[var(--c-text-1)] text-right">
            {board.name} <span className="text-[1.1rem] text-[var(--c-text-2)] ml-[0.7rem]">(by {board.authorEmail})</span>
          </h2>
          <div />
        </div>
        <div className="flex gap-6 overflow-x-auto flex-grow pb-4">
          {(board.columns || []).map((column) => (
            <ErrorBoundary key={column.id} fallback={<div>Error loading column: {column.name}</div>}>
              <KanbanColumn
                column={column}
                cards={column.cards || []}
                onCardClick={() => {}} // No-op for read-only
                onAddCard={() => {}} // No-op for read-only
                isReadOnly={true}
              />
            </ErrorBoundary>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ReadOnlyBoardView;
