import type { ModalProps } from '@/types';
// CSS fayllar index.css orqali import qilinadi

const Modal = ({ active, setActive, children }: ModalProps) => {
  const handleOverlayClick = () => {
    setActive(false);
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className={active ? "modal active" : "modal"}
      onClick={handleOverlayClick}
    >
      <div
        className={active ? "modal-content active" : "modal-content"}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

