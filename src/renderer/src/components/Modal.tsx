// src/renderer/src/components/Modal.tsx
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProps): React.JSX.Element | null {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  )
}
export default Modal