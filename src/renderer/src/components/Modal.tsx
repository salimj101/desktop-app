// src/renderer/src/components/Modal.tsx

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProps): React.JSX.Element | null {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--c-bg-2)] p-8 rounded-lg w-[90%] max-w-md relative shadow-[0_5px_15px_var(--c-shadow)] border border-[var(--c-border-1)]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-[10px] right-[15px] bg-none border-none text-2xl text-[var(--c-text-2)] cursor-pointer hover:text-[var(--c-text-1)] transition-colors" 
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}
export default Modal