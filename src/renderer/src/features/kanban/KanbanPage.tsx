import { useState, useEffect } from 'react'
import { Board } from '../../types'
import KanbanDashboard from './KanbanDashboard'
import BoardView from './BoardView'
import { Modal } from '../../components/Modal'
import { CreateBoardForm } from './components/CreateBoardForm'
import { EditBoardForm } from './components/EditBoardForm'

function KanbanPage(): React.JSX.Element {
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none')
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    const result = await window.api.getBoards()
    if (result.success && result.boards) {
      setBoards(result.boards)
    }
  }

  const handleCreateBoard = async (boardData: { name: string; description?: string }) => {
    const result = await window.api.createBoard(boardData)
    if (result.success && result.board) {
      setBoards([...boards, result.board])
      setModal('none')
    }
  }

  const handleEditBoard = async (boardData: { name: string; description?: string }) => {
    if (!editingBoard) return
    const result = await window.api.updateBoard(editingBoard.id, boardData)
    if (result.success && result.board) {
      setBoards(boards.map((b) => (b.id === editingBoard.id ? result.board : b)))
      setModal('none')
      setEditingBoard(null)
    }
  }

  const handleDeleteBoard = async (boardId: number) => {
    const result = await window.api.deleteBoard(boardId)
    if (result.success) {
      setBoards(boards.filter((b) => b.id !== boardId))
      if (selectedBoard?.id === boardId) {
        setSelectedBoard(null)
      }
    }
  }

  const handleBoardSelect = (board: Board) => {
    setSelectedBoard(board)
  }

  const handleBackToDashboard = () => {
    setSelectedBoard(null)
  }

  if (selectedBoard) {
    return <BoardView board={selectedBoard} onBack={handleBackToDashboard} onUpdate={fetchBoards} />
  }

  return (
    <>
      <KanbanDashboard
        boards={boards}
        onBoardSelect={handleBoardSelect}
        onCreateBoard={() => setModal('create')}
        onEditBoard={(board) => {
          setEditingBoard(board)
          setModal('edit')
        }}
        onDeleteBoard={handleDeleteBoard}
      />

      {modal === 'create' && (
        <Modal isOpen onClose={() => setModal('none')}>
          <CreateBoardForm onSubmit={handleCreateBoard} onCancel={() => setModal('none')} />
        </Modal>
      )}

      {modal === 'edit' && editingBoard && (
        <Modal
          isOpen
          onClose={() => {
            setModal('none')
            setEditingBoard(null)
          }}
        >
          <EditBoardForm
            board={editingBoard}
            onSubmit={handleEditBoard}
            onCancel={() => {
              setModal('none')
              setEditingBoard(null)
            }}
          />
        </Modal>
      )}
    </>
  )
}

export default KanbanPage
