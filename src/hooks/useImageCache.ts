import { useState, useEffect } from 'react';

/**
 * Hook de cache seguro para imagens offline.
 * Utiliza as URLs de assets estáticos diretamente (com cache nativo do navegador e CacheStorage do Service Worker),
 * evitando vazamento de memória e decodificação pesada de base64 no DOM.
 */
export function useImageCache(url: string | undefined): string | undefined {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(url);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  return currentUrl || url;
}

/**
 * Pré-carrega assets de imagens no CacheStorage do Service Worker de forma segura e não-bloqueante.
 */
export async function prefetchImagesToIndexedDB(urls: string[]) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open('geaagro-cache-v5');
    const validUrls = urls.filter(u => u && !u.startsWith('data:') && !u.startsWith('http'));
    // Fetch in chunks to avoid network congestion
    const chunkSize = 6;
    for (let i = 0; i < validUrls.length; i += chunkSize) {
      const chunk = validUrls.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (u) => {
          try {
            const match = await cache.match(u);
            if (!match) {
              const res = await fetch(u);
              if (res.ok) {
                await cache.put(u, res);
              }
            }
          } catch {
            // Ignora falhas pontuais de prefetch sem travar o app
          }
        })
      );
    }
  } catch (e) {
    console.warn('[Cache] Prefetch notice:', e);
  }
}


