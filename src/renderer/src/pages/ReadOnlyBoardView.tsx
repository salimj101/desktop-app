import { useState, useEffect } from 'react';
import { Board } from '../../../preload/index.d';
import { KanbanColumn } from '../components/KanbanColumn';
import { ErrorBoundary } from '../components/ErrorBoundary';
import styles from './ReadOnlyBoardView.module.css';

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
          columns: res.board.columns.map((col) => ({
            ...col,
            cards: Array.isArray(col.cards) ? col.cards : [],
          })),
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
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={onBack}>← Back to Public Boards</button>
          <h2>
            {board.name} <span className={styles.author}>(by {board.authorEmail})</span>
          </h2>
          <div />
        </div>
        <div className={styles.board}>
          {board.columns.map((column) => (
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
