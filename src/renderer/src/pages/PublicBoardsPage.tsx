import { useState, useEffect } from 'react';
import { PublicBoard } from '../../../preload/index.d';
import { ErrorBoundary } from '../components/ErrorBoundary';
import styles from './PublicBoardsPage.module.css';

interface PublicBoardsPageProps {
  onBoardSelect: (boardId: number) => void;
}

function PublicBoardsPage({ onBoardSelect }: PublicBoardsPageProps): React.JSX.Element {
  const [boards, setBoards] = useState<PublicBoard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicBoards = async () => {
      const res = await window.api.getPublicBoards();
      if (res.success && res.boards) {
        setBoards(res.boards);
      } else {
        setError(res.error || 'Failed to load public boards.');
      }
    };
    fetchPublicBoards();
  }, []);

  return (
    <ErrorBoundary fallback={<div>Error loading public boards. Please try again.</div>}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Public Boards</h2>
          <div />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {boards.length === 0 && !error ? (
          <div className={styles.noBoards}>
            <p>No public boards available.</p>
          </div>
        ) : (
          <div className={styles.boardGrid}>
            {boards.map((board) => (
              <div key={board.id} className={styles.boardCard} onClick={() => onBoardSelect(board.id)}>
                <div className={styles.cardHeader}>
                  <h3>{board.name}</h3>
                </div>
                <p className={styles.visibility}>by {board.authorEmail}</p>
                <span className={styles.createdAt}>
                  Created: {new Date(board.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default PublicBoardsPage;