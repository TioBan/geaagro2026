import React, { lazy } from 'react';

/**
 * Robust wrapper for dynamic React.lazy imports.
 * Automatically retries failed network chunk imports (e.g. after new deployments, dev server restarts, or intermittent network hiccups)
 * with exponential backoff before resolving to a graceful in-situ recovery component, preventing permanent unhandled rejection traps.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  maxRetries = 5
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await importFn();
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('page_reloaded_for_chunk');
        }
        return res;
      } catch (error) {
        lastError = error;
        console.warn(`[lazyWithRetry] Attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt < maxRetries) {
          // Fast progressive backoff (300ms, 600ms, 1000ms, 1500ms)
          await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 400, 2000)));
        }
      }
    }

    console.error(`[lazyWithRetry] All ${maxRetries} attempts failed to import chunk:`, lastError);

    // If in browser and haven't reloaded yet for this session chunk error, attempt reload once
    if (typeof window !== 'undefined') {
      const reloaded = window.sessionStorage.getItem('page_reloaded_for_chunk');
      if (!reloaded) {
        window.sessionStorage.setItem('page_reloaded_for_chunk', 'true');
        window.location.reload();
        return new Promise(() => {}); // Pause resolution while reloading
      }
    }

    // Graceful in-situ error component to prevent React.lazy permanent rejection trap
    return {
      default: function ResilientChunkFallback() {
        return React.createElement(
          'div',
          {
            className: 'bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm my-4'
          },
          React.createElement(
            'div',
            { className: 'w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold' },
            '⚠️'
          ),
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('h3', { className: 'text-base font-bold text-slate-900 dark:text-white' }, 'Módulo temporariamente indisponível'),
            React.createElement('p', { className: 'text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto' }, 'Ocorreu uma instabilidade momentânea na conexão ou reinicialização do servidor. Seus dados permanecem salvos e seguros localmente.'),
            lastError?.message && React.createElement('p', { className: 'text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg max-w-lg mx-auto overflow-x-auto text-left' }, lastError.message)
          ),
          React.createElement(
            'div',
            { className: 'flex items-center justify-center gap-3 pt-2' },
            React.createElement(
              'button',
              {
                onClick: () => {
                  if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('page_reloaded_for_chunk');
                    window.location.reload();
                  }
                },
                className: 'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer'
              },
              'Recarregar Módulo'
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  if (typeof window !== 'undefined') {
                    window.location.search = '?tab=dashboard';
                  }
                },
                className: 'px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer'
              },
              'Voltar ao Início'
            )
          )
        );
      }
    };
  });
}

