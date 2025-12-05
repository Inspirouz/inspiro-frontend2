import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false);

  // Try to use WebP if supported, fallback to original
  const getOptimizedSrc = () => {
    if (imageError) return src;
    
    // If image is PNG/JPG, try WebP version
    if (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')) {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      return webpSrc;
    }
    
    return src;
  };

  return (
    <picture>
      <source srcSet={getOptimizedSrc()} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onError={() => setImageError(true)}
        style={{ objectFit: 'cover' }}
      />
    </picture>
  );
};

export default OptimizedImage;






