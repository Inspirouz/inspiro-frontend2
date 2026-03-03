import { useState } from 'react';
import type { CardProps } from '@/types';
const IMAGE_BASE_URL = 'https://dev.api.inspiro.uz/images/';

function toImageUrl(image: string): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const path = image.startsWith('/') ? image.slice(1) : image;
  return `${IMAGE_BASE_URL}${path}`;
}
const Card = ({ item, onClick, variant = 'default' }: CardProps) => {
  const isPattern = variant === 'pattern';
  // Prefer images array, then img1, then logo
  const images =
    item.images && item.images.length > 0
      ? item.images
      : [];
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <article
      className={`card ${isPattern ? 'card--pattern' : ''}`}
      onClick={() => onClick?.(item)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={`${item.app_name} - ${item.text_info || 'View details'}`}
    >
      {/* Header section with logo and app name */}
      <div className="card__header">
        {item.logo && (
          <img
            className="card__logo"
            src={item.logo}
            alt={`${item.app_name} logo`}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="card__info">
          <h3 className="card__title">{item.app_name}</h3>
          {item.text_info && <p className="card__subtitle">{item.text_info}</p>}
        </div>
      </div>

      {/* Phone screenshot with navigation arrows */}
      <div className="card__phone-wrapper">
        {/* Left arrow */}
        <button 
          className="card__nav card__nav--left" 
          aria-label="Previous"
          onClick={handlePrevious}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <img
          className="card__phone-image"
          src={toImageUrl(images[currentIndex] || '')}
          alt={`${item.app_name} app screenshot`}
          loading="lazy"
          decoding="async"
        />

        {/* Right arrow */}
        <button 
          className="card__nav card__nav--right" 
          aria-label="Next"
          onClick={handleNext}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </article>
  );
};

export default Card;
