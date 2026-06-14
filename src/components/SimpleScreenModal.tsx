import { useState, useEffect, useRef } from 'react';
import '@/styles/image-preview-modal.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';

async function convertToPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

export interface SimpleScreen {
  image: string;
  title?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  screens: SimpleScreen[];
  initialIndex?: number;
}

const SimpleScreenModal = ({ isOpen, onClose, screens, initialIndex = 0 }: Props) => {
  const [idx, setIdx] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef(0);

  useEffect(() => { if (isOpen) setIdx(initialIndex); }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
      if (e.code === 'KeyC') handleCopyLink();
      if (e.code === 'KeyS') handleDownload();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, screens.length, onClose]);

  if (!isOpen || !screens[idx]) return null;

  const prev = () => { setSlideDir('prev'); setIdx(i => i > 0 ? i - 1 : screens.length - 1); };
  const next = () => { setSlideDir('next'); setIdx(i => i < screens.length - 1 ? i + 1 : 0); };

  const handleCopyLink = async () => {
    const screen = screens[idx];
    if (!screen) return;
    try {
      const res = await fetch(screen.image);
      const blob = await res.blob();
      const pngBlob = await convertToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const img = screens[idx];
    if (!img) return;
    try {
      const res = await fetch(img.image);
      const blob = await res.blob();
      const ext = img.image.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `screen_${idx + 1}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  return (
    <div className="ipm" onClick={onClose}>

      {/* Close */}
      <div className="ipm__top-right" onClick={e => e.stopPropagation()}>
        <button className="ipm__close" onClick={onClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Arrows */}
      <button className="ipm__arrow ipm__arrow--left" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Назад">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className="ipm__arrow ipm__arrow--right" onClick={e => { e.stopPropagation(); next(); }} aria-label="Вперёд">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Image */}
      <div className="ipm__body" onClick={e => e.stopPropagation()}>
        <div
          key={idx}
          className={`ipm__image-wrap ipm__image-wrap--${slideDir}`}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
          }}
        >
          <img src={screens[idx].image} alt={screens[idx].title || ''} className="ipm__image" />
          {screens.length > 1 && (
            <span className="ipm__pagination">{idx + 1} из {screens.length}</span>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <TooltipProvider delayDuration={300}>
        <div className="ipm__actions" onClick={e => e.stopPropagation()}>
          <div className="ipm__btn-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ipm__action-btn ipm__action-btn--secondary" onClick={handleCopyLink}>
                  {copied ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path transform="translate(2 8)" d="M14 4.9V9.1C14 12.6 12.6 14 9.1 14H4.9C1.4 14 0 12.6 0 9.1V4.9C0 1.4 1.4 0 4.9 0H9.1C12.6 0 14 1.4 14 4.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path transform="translate(8 2)" d="M14 4.9V9.1C14 12.6 12.6 14 9.1 14H8V10.9C8 7.4 6.6 6 3.1 6H0V4.9C0 1.4 1.4 0 4.9 0H9.1C12.6 0 14 1.4 14 4.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {copied ? 'Скопировано' : 'Скопировать'}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow>
                <span>Нажмите </span><kbd style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 4, padding: '1px 5px', fontSize: 12 }}>C</kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="ipm__btn-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ipm__action-btn ipm__action-btn--primary" onClick={handleDownload}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path transform="translate(2.48 8.9)" d="M13.96 0C17.56 0.31 19.03 2.16 19.03 6.21V6.34C19.03 10.81 17.24 12.6 12.77 12.6H6.26C1.79 12.6 0 10.81 0 6.34V6.21C0 2.19 1.45 0.34 4.99 0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path transform="translate(12 2)" d="M0 0V12.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path transform="translate(8.65 12.65)" d="M6.7 0L3.35 3.35L0 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Скачать
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow>
                <span>Нажмите </span><kbd style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 4, padding: '1px 5px', fontSize: 12 }}>S</kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

    </div>
  );
};

export default SimpleScreenModal;
