import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Board } from '../../../preload/index.d';
import { ErrorBoundary } from '../components/ErrorBoundary';
import styles from './KanbanDashboard.module.css';

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

interface KanbanDashboardProps {
  onBoardSelect: (boardId: number) => void;
  onCreateBoard: () => void;
  onEditBoard: (board: Board) => void;
}

function KanbanDashboard({ onBoardSelect, onCreateBoard, onEditBoard }: KanbanDashboardProps): React.JSX.Element {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    setIsLoading(true);
    const res = await window.api.getBoards();
    if (res.success && res.boards) {
      setBoards(res.boards);
      setError(null);
    } else {
      setError(res.error || 'Failed to load boards.');
      toast.error(res.error || 'Failed to load boards.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDelete = async (e: React.MouseEvent, boardId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board and all its contents? This action cannot be undone.')) {
      return;
    }
    const res = await window.api.deleteBoard(boardId);
    if (res.success) {
      setBoards(boards.filter((b) => b.id !== boardId));
      toast.success('Board deleted successfully!');
    } else {
      toast.error(res.error || 'Failed to delete board.');
    }
  };

  const handleEdit = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    onEditBoard(board);
  };

  if (isLoading) {
    return <div>Loading your boards...</div>;
  }

  return (
    <ErrorBoundary fallback={<div>Error loading boards. Please try again.</div>}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>My Kanban Boards</h2>
          <button onClick={onCreateBoard} className={styles.createBtn} aria-label="Create new board">
            + Create New Board
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {boards.length > 0 ? (
          <div className={styles.boardGrid}>
            {boards.map((board) => (
              <div
                key={board.id}
                className={styles.boardCard}
                onClick={() => onBoardSelect(board.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onBoardSelect(board.id)}
              >
                <div className={styles.cardHeader}>
                  <h3>{board.name}</h3>
                  <div className={styles.actions}>
                    <button
                      onClick={(e) => handleEdit(e, board)}
                      title="Edit board"
                      aria-label={`Edit board ${board.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, board.id)}
                      className={styles.deleteBtn}
                      title="Delete board"
                      aria-label={`Delete board ${board.name}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                <p className={styles.visibility}>{board.visibility}</p>
                <span className={styles.createdAt}>
                  Created: {new Date(board.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noBoards}>
            <p>You don't have any boards yet.</p>
            <button onClick={onCreateBoard} className={styles.createBtn} aria-label="Create your first board">
              Create Your First Board
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default KanbanDashboard;
