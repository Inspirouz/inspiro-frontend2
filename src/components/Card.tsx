import { useState } from 'react';
import type { CardProps } from '@/types';

const Card = ({ item, onClick, variant = 'default' }: CardProps) => {
  const isPattern = variant === 'pattern';
  
  // Use images array if available, otherwise use img1
  const images = item.images && item.images.length > 0 ? item.images : [item.img1];
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
        <img
          className="card__logo"
          src={item.img2}
          alt={`${item.app_name} logo`}
          loading="lazy"
          decoding="async"
        />
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
          src={images[currentIndex]}
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
