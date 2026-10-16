// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useImageCache } from '../hooks/useImageCache';
import { generateNematodeMicroscopeSvg, generateNematodeFieldDamageSvg } from '../utils/nematodeIllustrations';

export interface OfflineImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  referrerPolicy?: string;
  speciesId?: string;
  anatomyType?: string;
  viewType?: 'microscope' | 'field';
  scientificName?: string;
  [key: string]: any;
}

export function OfflineImage({
  src,
  alt = 'Imagem de Nematoide',
  className = '',
  style,
  speciesId,
  anatomyType = 'vermiform',
  viewType = 'microscope',
  scientificName,
  ...props
}: OfflineImageProps) {
  const cachedSrc = useImageCache(src);
  const [hasError, setHasError] = useState(false);

  // Reset error if source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If the src is clearly a placeholder or missing, or error occurred, use the scientific offline illustration
  const isInvalidSrc = !src || src.includes('placeholder_nematode') || src.includes('/src/assets/images/');

  if (isInvalidSrc || hasError) {
    const fallbackSvgUri = viewType === 'field'
      ? generateNematodeFieldDamageSvg(speciesId || 'unknown', anatomyType, scientificName || alt)
      : generateNematodeMicroscopeSvg(speciesId || 'unknown', anatomyType, scientificName || alt);

    return (
      <img
        src={fallbackSvgUri}
        alt={alt}
        className={className}
        style={style}
        referrerPolicy="no-referrer"
        loading="lazy"
        {...props}
      />
    );
  }

  return (
    <img
      src={cachedSrc || src}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => {
        setHasError(true);
      }}
      loading="lazy"
      {...props}
    />
  );
}
