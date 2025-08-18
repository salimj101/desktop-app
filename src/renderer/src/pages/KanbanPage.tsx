import { useState } from 'react';
import toast from 'react-hot-toast';
import { Board } from '../../../preload/index.d';
import KanbanDashboard from './KanbanDashboard';
import BoardView from './BoardView';
import Modal from '../components/Modal';
import CreateBoardForm from '../components/CreateBoardForm';
import EditBoardForm from '../components/EditBoardForm';

function KanbanPage(): React.JSX.Element {
  const [view, setView] = useState<{ type: 'dashboard' | 'board'; boardId?: number }>({
    type: 'dashboard',
  });
  const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none');
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateBoard = async (data: { name: string; visibility: 'private' | 'public'; columns: string[] }) => {
    const result = await window.api.createBoard(data);
    if (result.success && result.board) {
      setModal('none');
      setView({ type: 'board', boardId: result.board.id });
      toast.success('Board created successfully!');
    } else {
      toast.error(result.error || 'Failed to create board.');
    }
  };

  const handleEditBoard = async (data: { boardId: number; name: string; visibility: 'private' | 'public' }) => {
    const result = await window.api.updateBoard(data);
    if (result.success) {
      setModal('none');
      setBoardToEdit(null);
      setRefreshKey((prev) => prev + 1);
      toast.success('Board updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update board.');
    }
  };

  const handleBackToDashboard = () => {
    setView({ type: 'dashboard' });
    setRefreshKey((prev) => prev + 1);
  };

  if (view.type === 'board' && view.boardId) {
    return <BoardView boardId={view.boardId} onBack={handleBackToDashboard} />;
  }

  return (
    <>
      <KanbanDashboard
        key={refreshKey}
        onBoardSelect={(boardId) => setView({ type: 'board', boardId })}
        onCreateBoard={() => setModal('create')}
        onEditBoard={(board) => {
          setBoardToEdit(board);
          setModal('edit');
        }}
      />
      <Modal isOpen={modal === 'create'} onClose={() => setModal('none')}>
        <CreateBoardForm onSubmit={handleCreateBoard} onCancel={() => setModal('none')} />
      </Modal>
      {boardToEdit && (
        <Modal isOpen={modal === 'edit'} onClose={() => setModal('none')}>
          <EditBoardForm board={boardToEdit} onSubmit={handleEditBoard} onCancel={() => setModal('none')} />
        </Modal>
      )}
    </>
  );
}

export default KanbanPage;
