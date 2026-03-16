import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@/styles/image-preview-modal.css';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: number | string; screenId?: number | string; image: string; title: string }>;
  initialIndex?: number;
  appInfo?: {
    logo: string;
    name: string;
    description: string;
  };
  treeStructure?: Array<{
    id: string;
    label: string;
    sectionId: string;
    count: number;
    children?: Array<any>;
  }>;
  activeTreeItem?: string | null;
  onTreeItemClick?: (sectionId: string, itemId: string) => void;
  activeTab?: 'screens' | 'scenarios' | 'videos';
  subCategories?: Array<{
    id: string;
    label: string;
    count: number;
  }>;
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
  treeStructure = [],
  activeTreeItem = null,
  onTreeItemClick,
  activeTab = 'screens',
  subCategories = [],
  activeSubCategory,
  onSubCategoryClick,
  screenMeta,
  screenMetaLoading = false,
}: ImagePreviewModalProps) => {
  const [, setSearchParams] = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = appInfo?.name ?? document.title;
    const text = appInfo?.description ?? '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            // ignore
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setCurrentIndex(newIndex);
        const screenId = images[newIndex]?.id;
        if (screenId) {
          setSearchParams({ screen: screenId.toString() });
        }
      } else if (e.key === 'ArrowRight') {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        const screenId = images[newIndex]?.id;
        if (screenId) {
          setSearchParams({ screen: screenId.toString() });
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images, setSearchParams, onClose]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    const screen = images[newIndex];
    const screenId = screen?.screenId ?? screen?.id;
    if (screenId != null) {
      setSearchParams({ screen: String(screenId) });
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    const screen = images[newIndex];
    const screenId = screen?.screenId ?? screen?.id;
    if (screenId != null) {
      setSearchParams({ screen: String(screenId) });
    }
  };

  // Recursive component for rendering tree nodes - same as DetailPage
  const TreeNodeComponent = ({
    node,
    activeTreeItem,
    onItemClick,
    className = '',
    level = 0,
  }: {
    node: any;
    activeTreeItem: string | null;
    onItemClick?: (sectionId: string, itemId: string) => void;
    level?: number;
    className?: string;
  }) => {
    return (
      <div className={`image-preview-modal__tree-row ${className}`}>
        <button
          className={`image-preview-modal__tree-button ${activeTreeItem === node.id ? 'active' : ''}`}
          onClick={() => node.sectionId && onItemClick && onItemClick(node.sectionId, node.id)}
        >
          <span className="image-preview-modal__tree-label">{node.label}</span>
          <span className="image-preview-modal__tree-count">{node.count}</span>
        </button>
        {node.children && node.children.length > 0 && (
          <div className="image-preview-modal__tree-children">
            {node.children.map((child: any) => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                activeTreeItem={activeTreeItem}
                onItemClick={onItemClick}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const nonEmptySubCategories = subCategories.filter((subCat) => subCat.count > 0);
  const allSubCategoriesCount = nonEmptySubCategories.reduce(
    (sum, subCat) => sum + subCat.count,
    0
  );
  const subCategoriesWithAll =
    activeTab !== 'scenarios' && allSubCategoriesCount > 0
      ? [{ id: 'all', label: 'Все', count: allSubCategoriesCount }, ...nonEmptySubCategories]
      : nonEmptySubCategories;

  return (
    <div className="image-preview-modal" onClick={onClose}>
      <div className="image-preview-modal__content" onClick={(e) => e.stopPropagation()}>
        
        <div className="image-preview-modal__layout">
          
          {/* Left - App Info & Tree/Subcategories */}
          <div className="image-preview-modal__left">
            {appInfo && (
              <div className="image-preview-modal__app-branding">
                <img 
                  src={appInfo.logo} 
                  alt={appInfo.name}
                  className="image-preview-modal__app-logo"
                />
                <div className="image-preview-modal__app-info">
                  <h2 className="image-preview-modal__app-name">{appInfo.name}</h2>
                  <p className="image-preview-modal__app-description">{appInfo.description}</p>
                </div>
              </div>
            )}
            
            {/* Show tree only for scenarios tab */}
            {activeTab === 'scenarios' && treeStructure.length > 0 && (
              <div className="image-preview-modal__tree">
                {treeStructure.filter((item) => item.count > 0).map((item) => (
                  <TreeNodeComponent
                    key={item.id}
                    node={item}
                    activeTreeItem={activeTreeItem}
                    onItemClick={onTreeItemClick}
                    level={0}
                    className="parent-tree-row"
                  />
                ))}
              </div>
            )}

            {/* Show subcategories for other tabs */}
            {activeTab !== 'scenarios' && subCategoriesWithAll.length > 0 && (
              <div className="image-preview-modal__subcategories">
                {subCategoriesWithAll.map((subCat) => (
                  <button
                    key={subCat.id}
                    className={`image-preview-modal__subcategory ${
                      activeSubCategory === subCat.id ? 'active' : ''
                    }`}
                    onClick={() => onSubCategoryClick && onSubCategoryClick(subCat.id)}
                  >
                    {subCat.label}
                    <span className="image-preview-modal__subcategory-count">{subCat.count}</span>
        </button>
                ))}
              </div>
            )}
          </div>

 {/* Center - Image Only (No Frame) */}
 <div className="image-preview-modal__center">
         
            <div className="image-preview-modal__image-container">
              {/* Navigation Arrows */}
            <button 
              className="image-preview-modal__nav-arrow image-preview-modal__nav-arrow--left"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
<div className='image-preview-modal__image-container-wrapper'>
              <div className='image-preview-modal__image-wrapper'>
                <img 
                  src={currentImage.image} 
                  alt={currentImage.title}
                  className="image-preview-modal__image"
                />
                {/* Footer Pagination */}
            <div className="image-preview-modal__pagination">
              {currentIndex + 1} из {images.length}
            </div>
          </div>

         
         <div className='image-preview-modal__info-container'>
            <div className="image-preview-modal__info-header">
              <button type="button" className="image-preview-modal__share-btn" onClick={handleShare} aria-label="Поделиться">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.15833 11.2583L12.8417 7.74167M12.8417 12.2583L7.15833 8.74167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Поделиться
              </button>
              <button 
                className=" image-preview-modal__close"
              onClick={onClose} aria-label="Close"
              >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
              </button>
            </div>
         <div className="image-preview-modal__info-box">
            <div className="image-preview-modal__info-content">
              {/* Upload date */}
              <div className="image-preview-modal__info-item">
                <span className="image-preview-modal__info-label">Upload date</span>
                <span className="image-preview-modal__info-value">
                  {screenMetaLoading
                    ? '00.00.0000 00:00'
                    : screenMeta?.uploadDate || '—'}
                </span>
              </div>

              {/* Resolution */}
              {/* <div className="image-preview-modal__info-item">
                <span className="image-preview-modal__info-label">Resolution</span>
                <span className="image-preview-modal__info-value">
                  {screenMetaLoading
                    ? 'Loading...'
                    : screenMeta?.resolution || '—'}
                </span>
              </div> */}

              {/* Scenarios */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">Сценарии</h3>
                <div className="image-preview-modal__tags">
                  {screenMeta?.scenarios && screenMeta.scenarios.length > 0 ? screenMeta.scenarios.map((tag, idx) => {
                    const label = toTagLabel(tag);
                    return label ? (
                      <span key={toTagKey(tag, idx)} className="image-preview-modal__tag">
                        {label}
                      </span>
                    ) : '-';
                  }) : '-'}
                </div>
              </div>

              {/* UI Elements */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">UI Элементы</h3>
                <div className="image-preview-modal__tags">
                  {(screenMeta?.uiElements && screenMeta.uiElements.length > 0
                    ? screenMeta.uiElements
                    : []
                  ).map((tag, idx) => {
                    const label = toTagLabel(tag);
                    return label ? (
                      <span key={toTagKey(tag, idx)} className="image-preview-modal__tag">
                        {label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Patterns */}
              <div className="image-preview-modal__info-section">
                <h3 className="image-preview-modal__info-section-title">Паттерны</h3>
                <div className="image-preview-modal__tags">
                  {(screenMeta?.patterns && screenMeta.patterns.length > 0
                    ? screenMeta.patterns
                    : []
                  ).map((tag, idx) => {
                    const label = toTagLabel(tag);
                    return label ? (
                      <span key={toTagKey(tag, idx)} className="image-preview-modal__tag">
                        {label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
          </div>  

</div>

              <button 
                className="image-preview-modal__nav-arrow image-preview-modal__nav-arrow--right"
                onClick={handleNext}
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
<div>
         

</div>
        
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
