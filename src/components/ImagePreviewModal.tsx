import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '@/styles/image-preview-modal.css';
import iconDownload from '@/assets/icon-download.svg';
import iconLink from '@/assets/icon-link.svg';
import { isVideoUrl } from '@/lib/media';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: number | string; screenId?: number | string; image: string; title: string; categoryId?: string }>;
  initialIndex?: number;
  appInfo?: {
    logo: string;
    name: string;
    description: string;
    projectId?: string;
  };
  treeStructure?: Array<{ id: string; label: string; sectionId: string; count: number; children?: Array<any> }>;
  activeTreeItem?: string | null;
  onTreeItemClick?: (sectionId: string, itemId: string) => void;
  activeTab?: 'screens' | 'scenarios' | 'videos';
  subCategories?: Array<{ id: string; label: string; count: number }>;
  activeSubCategory?: string;
  onSubCategoryClick?: (categoryId: string) => void;
  screenMeta?: {
    uploadDate?: string;
    resolution?: string;
    scenarios?: (string | { id?: string; name?: string; type?: string })[];
    uiElements?: (string | { id?: string; name?: string; type?: string })[];
    patterns?: (string | { id?: string; name?: string; type?: string })[];
  } | null;
  screenMetaLoading?: boolean;
}

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

function toTagLabel(item: string | { id?: string; name?: string; type?: string }): string {
  if (typeof item === 'string') return item;
  const name = item?.name ?? item?.id;
  return name != null ? String(name) : '';
}
function toTagKey(item: string | { id?: string; name?: string; type?: string }, idx: number): string {
  if (typeof item === 'string') return item;
  const id = item?.id;
  return id != null ? String(id) : `tag-${idx}`;
}

const ImagePreviewModal = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  appInfo,
  screenMeta,
  screenMetaLoading = false,
}: ImagePreviewModalProps) => {
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef(0);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') onClose();
      else if (e.code === 'KeyC') handleCopyLink();
      else if (e.code === 'KeyS') handleDownload();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images, onClose]);

  const goTo = (idx: number, dir: 'next' | 'prev' = 'next') => {
    setSlideDir(dir);
    setCurrentIndex(idx);
    const screen = images[idx];
    const screenId = screen?.screenId ?? screen?.id;
    if (screenId != null) setSearchParams({ screen: String(screenId) });
  };
  const goPrev = () => goTo(currentIndex > 0 ? currentIndex - 1 : images.length - 1, 'prev');
  const goNext = () => goTo(currentIndex < images.length - 1 ? currentIndex + 1 : 0, 'next');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: appInfo?.name ?? '', url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const handleCopyLink = async () => {
    const img = images[currentIndex];
    if (!img) return;
    try {
      const res = await fetch(img.image);
      const blob = await res.blob();
      const pngBlob = await convertToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const img = images[currentIndex];
    if (!img) return;
    try {
      const res = await fetch(img.image);
      const blob = await res.blob();
      const ext = img.image.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${appInfo?.name ?? 'screen'}_${currentIndex + 1}.${ext}`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  if (!isOpen || images.length === 0) return null;
  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const hasMetaContent =
    screenMeta?.uploadDate ||
    screenMeta?.resolution ||
    (screenMeta?.scenarios?.length ?? 0) > 0 ||
    (screenMeta?.uiElements?.length ?? 0) > 0 ||
    (screenMeta?.patterns?.length ?? 0) > 0;

  return (
    <div className="ipm" onClick={onClose}>

      {/* Top-right: Share + Close */}
      <div className="ipm__top-right" onClick={e => e.stopPropagation()}>
        <button className="ipm__share-btn" onClick={handleShare} aria-label="Поделиться">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path transform="translate(2.48 8.9)" d="M13.96 0C17.56 0.31 19.03 2.16 19.03 6.21V6.34C19.03 10.81 17.24 12.6 12.77 12.6H6.26C1.79 12.6 0 10.81 0 6.34V6.21C0 2.19 1.45 0.34 4.99 0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path transform="translate(12 3.62)" d="M0 11.38V0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path transform="translate(8.65 2.5)" d="M6.7 3.35L3.35 0L0 3.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ipm__share-text">Поделиться</span>
        </button>
        <button className="ipm__close" onClick={onClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Nav arrows */}
      <button className="ipm__arrow ipm__arrow--left" onClick={e => { e.stopPropagation(); goPrev(); }} aria-label="Previous">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className="ipm__arrow ipm__arrow--right" onClick={e => { e.stopPropagation(); goNext(); }} aria-label="Next">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Body: image + info card */}
      <div className="ipm__body" onClick={e => e.stopPropagation()}>

        {/* Phone image */}
        <div
          key={currentIndex}
          className={`ipm__image-wrap ipm__image-wrap--${slideDir}`}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
          }}
        >
          {isVideoUrl(currentImage.image) ? (
            <video
              key={currentImage.image}
              src={currentImage.image}
              className="ipm__image ipm__video"
              controls
              autoPlay
              playsInline
              loop
              preload="metadata"
            />
          ) : (
            <img src={currentImage.image} alt={currentImage.title} className="ipm__image" />
          )}
          <span className="ipm__pagination">{currentIndex + 1} из {images.length}</span>
        </div>

        {/* Info card */}
        {(appInfo || hasMetaContent) && (
          <div className="ipm__card">

            {/* App row */}
            {appInfo && (
              <div
                className={`ipm__card-app${appInfo.projectId ? ' ipm__card-app--link' : ''}`}
                onClick={() => appInfo.projectId && navigate(`/detail/${appInfo.projectId}`)}
              >
                {appInfo.logo ? (
                  <img src={appInfo.logo} alt={appInfo.name} className="ipm__card-logo" />
                ) : (
                  <div className="ipm__card-logo ipm__card-logo--placeholder">
                    {(appInfo.name?.trim()?.[0] ?? '?').toUpperCase()}
                  </div>
                )}
                <div className="ipm__card-app-info">
                  <p className="ipm__card-app-name">{appInfo.name}</p>
                  <p className="ipm__card-app-desc">{appInfo.description}</p>
                </div>
              </div>
            )}

            {/* Upload date + resolution */}
            {(screenMeta?.uploadDate || screenMeta?.resolution) && (
              <div className="ipm__card-meta">
                {screenMeta.uploadDate && (
                  <div className="ipm__card-meta-item">
                    <span className="ipm__card-meta-label">Upload date</span>
                    <span className="ipm__card-meta-value">
                      {screenMetaLoading ? '—' : screenMeta.uploadDate}
                    </span>
                  </div>
                )}
                {screenMeta.resolution && (
                  <div className="ipm__card-meta-item">
                    <span className="ipm__card-meta-label">Resolution</span>
                    <span className="ipm__card-meta-value">
                      {screenMetaLoading ? '—' : screenMeta.resolution}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {hasMetaContent && <hr className="ipm__card-divider" />}

            {/* Tags */}
            <div className="ipm__card-tags">
              {screenMeta?.scenarios && screenMeta.scenarios.length > 0 && (
                <div className="ipm__card-section">
                  <h3 className="ipm__card-section-title">Сценарии</h3>
                  <div className="ipm__tags">
                    {screenMeta.scenarios.map((t, i) => {
                      const label = toTagLabel(t);
                      return label ? <span key={toTagKey(t, i)} className="ipm__tag">{label}</span> : null;
                    })}
                  </div>
                </div>
              )}
              {screenMeta?.uiElements && screenMeta.uiElements.length > 0 && (
                <div className="ipm__card-section">
                  <h3 className="ipm__card-section-title">UI Элементы</h3>
                  <div className="ipm__tags">
                    {screenMeta.uiElements.map((t, i) => {
                      const label = toTagLabel(t);
                      return label ? <span key={toTagKey(t, i)} className="ipm__tag">{label}</span> : null;
                    })}
                  </div>
                </div>
              )}
              {screenMeta?.patterns && screenMeta.patterns.length > 0 && (
                <div className="ipm__card-section">
                  <h3 className="ipm__card-section-title">Паттерны</h3>
                  <div className="ipm__tags">
                    {screenMeta.patterns.map((t, i) => {
                      const label = toTagLabel(t);
                      return label ? <span key={toTagKey(t, i)} className="ipm__tag">{label}</span> : null;
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="ipm__actions" onClick={e => e.stopPropagation()}>
        <div className="ipm__btn-wrap">
          <div className="ipm__tooltip"><span className="ipm__tooltip-text">Нажмите</span><span className="ipm__tooltip-key">C</span></div>
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
        </div>
        <div className="ipm__btn-wrap">
          <div className="ipm__tooltip"><span className="ipm__tooltip-text">Нажмите</span><span className="ipm__tooltip-key">S</span></div>
          <button className="ipm__action-btn ipm__action-btn--primary" onClick={handleDownload}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path transform="translate(2.48 8.9)" d="M13.96 0C17.56 0.31 19.03 2.16 19.03 6.21V6.34C19.03 10.81 17.24 12.6 12.77 12.6H6.26C1.79 12.6 0 10.81 0 6.34V6.21C0 2.19 1.45 0.34 4.99 0.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path transform="translate(12 2)" d="M0 0V12.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path transform="translate(8.65 12.65)" d="M6.7 0L3.35 3.35L0 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Скачать
          </button>
        </div>
      </div>

    </div>
  );
};

export default ImagePreviewModal;
