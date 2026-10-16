import DOMPurify from 'dompurify';

/**
 * Universal SVG Sanitizer using DOMPurify
 * Works seamlessly across browser DOM and Node/JSDOM test environments.
 */
export function sanitizeSvg(svgContent: string): string {
  if (!svgContent) return '';

  let svg = svgContent.trim();
  if (svg.startsWith('data:image/svg+xml')) {
    const commaIndex = svg.indexOf(',');
    if (commaIndex !== -1) {
      svg = svg.substring(commaIndex + 1);
    }
  }

  try {
    if (svg.includes('%3C') || svg.includes('%20') || svg.includes('%22')) {
      svg = decodeURIComponent(svg);
    }
  } catch {
    // fallback to original if decoding fails
  }

  svg = svg.replace(/%23/g, '#');

  // If running in browser or environment with window
  if (typeof window !== 'undefined') {
    const purifyInstance = typeof DOMPurify === 'function' ? (DOMPurify as any)(window) : DOMPurify;
    return purifyInstance.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['use'],
    });
  }

  // Fallback regex sanitizer if DOMPurify is unavailable in non-DOM environment
  return svg
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<(iframe|object|embed|applet|form|input|base|link)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|xlink:href)\s*=\s*["']?\s*javascript:[^"'>]*/gi, '$1=""')
    .replace(/(href|xlink:href)\s*=\s*["']?\s*data:text\/html[^"'>]*/gi, '$1=""');
}
