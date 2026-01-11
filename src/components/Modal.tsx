import type { ModalProps } from '@/types';
// CSS fayllar index.css orqali import qilinadi

const Modal = ({ active, setActive, children }: ModalProps) => {
  const handleOverlayClick = () => {
    setActive(false);
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Don't render anything if modal is not active
  if (!active) {
    return null;
  }

  return (
    <div
      className="modal active"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content active"
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

