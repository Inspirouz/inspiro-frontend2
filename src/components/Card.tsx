import { useState, useRef, useEffect } from 'react';
import type { CardProps } from '@/types';
import { isVideoUrl } from '@/lib/media';

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const root = apiUrl.replace(/\/api\/?$/, '');
  return `${root}/images/`;
}

function toImageUrl(image: string): string {
  if (!image) return '';
  let cleaned = image;
  const matches = [...image.matchAll(/https?:\/+/gi)];
  const last = matches.length > 0 ? matches[matches.length - 1] : undefined;
  if (last && last.index !== undefined && last.index > 0) cleaned = image.slice(last.index);
  cleaned = cleaned.replace(/^(https?:)\/+/i, '$1//');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const path = cleaned.startsWith('/') ? cleaned.slice(1) : cleaned;
  return `${getImageBaseUrl()}${path}`;
}


const Card = ({ item, onClick, variant = 'default' }: CardProps) => {
  const isPattern = variant === 'pattern';
  const images = item.images && item.images.length > 0 ? item.images : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(item);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentUrl = toImageUrl(images[currentIndex] || '');
  const isVideo = isVideoUrl(currentUrl);

  return (
    <div
      className={`card ${isPattern ? 'card--pattern' : ''}`}
      onClick={() => onClick?.(item)}
      role={onClick ? 'button' : 'listitem'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={`${item.app_name} - ${item.text_info || 'View details'}`}
    >
      {/* Header */}
      <div className="card__header">
        {item.logo ? (
          <img
            className="card__logo"
            src={item.logo}
            alt={`${item.app_name} logo`}
            loading="eager"
          />
        ) : (
          <div
            className="card__logo"
            aria-label={`${item.app_name} logo placeholder`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#242424',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            {(item.app_name?.trim()?.[0] ?? '?').toUpperCase()}
          </div>
        )}
        <div className="card__info">
          <h3 className="card__title">{item.app_name}</h3>
          {item.text_info && <p className="card__subtitle">{item.text_info}</p>}
        </div>
      </div>

      {/* Media */}
      <div className="card__phone-wrapper">
        <button className="card__nav card__nav--left" aria-label="Previous" onClick={handlePrevious}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isVideo ? (
          <video
            ref={videoRef}
            className="card__phone-image"
            src={currentUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            className="card__phone-image"
            src={currentUrl}
            alt={`${item.app_name} app screenshot`}
            loading="eager"
          />
        )}

        <button className="card__nav card__nav--right" aria-label="Next" onClick={handleNext}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Card;
