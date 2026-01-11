import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@/styles/image-preview-modal.css';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: number; image: string; title: string }>;
  initialIndex?: number;
}

const ImagePreviewModal = ({ isOpen, onClose, images, initialIndex = 0 }: ImagePreviewModalProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    const screenId = images[newIndex]?.id;
    if (screenId) {
      setSearchParams({ screen: screenId.toString() });
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    const screenId = images[newIndex]?.id;
    if (screenId) {
      setSearchParams({ screen: screenId.toString() });
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div className="image-preview-modal" onClick={onClose}>
      <div className="image-preview-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="image-preview-modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="image-preview-modal__main">
          {/* Left side - Phone mockup */}
          <div className="image-preview-modal__phone-container">
            {/* Navigation arrow left */}
            <button 
              className="image-preview-modal__nav-arrow image-preview-modal__nav-arrow--left"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Phone mockup */}
            <div className="image-preview-modal__phone-mockup">
              <div className="image-preview-modal__phone-status-bar">
                <span>9:41</span>
                <div className="image-preview-modal__phone-icons">
                  <span>📶</span>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>
              <div className="image-preview-modal__phone-screen">
                <img 
                  src={currentImage.image} 
                  alt={currentImage.title}
                  className="image-preview-modal__phone-image"
                />
              </div>
            </div>

            {/* Navigation arrow right */}
            <button 
              className="image-preview-modal__nav-arrow image-preview-modal__nav-arrow--right"
              onClick={handleNext}
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Pagination */}
            <div className="image-preview-modal__pagination">
              {currentIndex + 1} из {images.length}
            </div>
          </div>

          {/* Right side - Information panel */}
          <div className="image-preview-modal__info-panel">
            <div className="image-preview-modal__info-header">
              <button className="image-preview-modal__share-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.15833 11.2583L12.8417 7.74167M12.8417 12.2583L7.15833 8.74167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Поделиться
              </button>
            </div>

            <div className="image-preview-modal__info-content">
              {/* Upload date */}
              <div className="image-preview-modal__info-item">
                <span className="image-preview-modal__info-label">Upload date</span>
                <span className="image-preview-modal__info-value">14 Sep, 2025</span>
              </div>

              {/* Resolution */}
              <div className="image-preview-modal__info-item">
                <span className="image-preview-modal__info-label">Resolution</span>
                <span className="image-preview-modal__info-value">393x852</span>
              </div>

              {/* Scenarios */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">Сценарии</h3>
                <div className="image-preview-modal__tags">
                  <span className="image-preview-modal__tag">Регистрация</span>
                  <span className="image-preview-modal__tag">Вход</span>
                </div>
              </div>

              {/* UI Elements */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">UI Элементы</h3>
                <div className="image-preview-modal__tags">
                  <span className="image-preview-modal__tag">Форма</span>
                  <span className="image-preview-modal__tag">Кнопка</span>
                  <span className="image-preview-modal__tag">Tab bar</span>
                  <span className="image-preview-modal__tag">Nav bar</span>
                </div>
              </div>

              {/* Patterns */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">Паттерны</h3>
                <div className="image-preview-modal__tags">
                  <span className="image-preview-modal__tag">Регистрация</span>
                  <span className="image-preview-modal__tag">Регистрация</span>
                  <span className="image-preview-modal__tag">Регистрация</span>
                  <span className="image-preview-modal__tag">Регистрация</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;

