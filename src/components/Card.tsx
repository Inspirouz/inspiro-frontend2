import '@/styles/header-search.css';
import type { CardProps } from '@/types';

const Card = ({ item, onClick, variant = 'default' }: CardProps) => {
  const isPattern = variant === 'pattern';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(item);
    }
  };

  // Debug: log image path
  if (typeof window !== 'undefined') {
    console.log('Card image path:', item.img1, 'Type:', typeof item.img1);
  }

  return (
    <article
      className="key-block"
      onClick={() => onClick?.(item)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={`${item.app_name} - ${item.text_info || 'View details'}`}
    >
      <div className={isPattern ? "patterns-list-content" : "list-content"}>
        <img
          className={isPattern ? "P_unitrip-img" : "unitrip-img"}
          src={item.img1}
          alt={item.app_name}
          loading="lazy"
          decoding="async"
          style={{ 
            width: '200px',
            height: 'auto',
            maxWidth: '100%',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            flexShrink: 0
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('❌ Image failed to load:', {
              src: item.img1,
              type: typeof item.img1,
              currentSrc: target.currentSrc,
              naturalWidth: target.naturalWidth,
              naturalHeight: target.naturalHeight
            });
            target.style.border = '2px solid red';
            target.style.backgroundColor = '#ff000020';
            target.style.minHeight = '100px';
            target.style.minWidth = '100px';
          }}
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('✅ Image loaded successfully:', {
              src: item.img1,
              naturalWidth: target.naturalWidth,
              naturalHeight: target.naturalHeight
            });
          }}
        />
      </div>
      <div className={isPattern ? "P_main-content-view-title" : "main-content-view-title"}>
        <img
          className={isPattern ? "P_MainLogoMini" : "MainLogoMini"}
          src={item.img2}
          alt={`${item.app_name} logo`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={(e) => {
            console.error('Logo failed to load:', item.img2);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="content-view-title">
          <h3>{item.app_name}</h3>
          {!isPattern && item.text_info && <p>{item.text_info}</p>}
        </div>
      </div>
    </article>
  );
};

export default Card;

