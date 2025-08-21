import { useState, useEffect } from 'react';
import { Board } from '../../types';
import { ErrorBoundary } from '../../components/ErrorBoundary';

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
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 box-border">
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <h2 className="text-[1.8rem] text-[var(--c-text-1)]">Public Boards</h2>
          <div />
        </div>
        {error && <p className="text-[var(--c-error)] my-4 text-[1.1rem]">{error}</p>}
        {boards.length === 0 && !error ? (
          <div className="text-center py-16 flex-grow">
            <p className="mb-6 text-[1.1rem] text-[var(--c-text-2)]">No public boards available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 flex-grow pb-4 [scrollbar-width:thin] [scrollbar-color:var(--c-accent-1)_var(--c-bg-2)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[var(--c-bg-2)] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[var(--c-accent-1)] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[var(--c-accent-2)]">
            {boards.map((board) => (
              <div key={board.id} className="bg-[var(--c-bg-2)] p-6 rounded-lg border border-[var(--c-border-1)] cursor-pointer transition-all flex flex-col hover:transform hover:-translate-y-[5px] hover:shadow-[0_8px_15px_var(--c-shadow)]" onClick={() => onBoardSelect(board.id)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[var(--c-text-1)] text-[1.2rem] mr-4">{board.name}</h3>
                </div>
                <p className="capitalize text-[var(--c-text-2)] text-[0.9rem] mb-4">by {board.authorEmail}</p>
                <span className="text-[0.8rem] text-[var(--c-text-2)] mt-auto">
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
