/**
 * Web Worker para Processamento Estatístico Pesado — GeaAgro Estatística
 *
 * Executa rotinas computacionais intensivas (PCA, Agrupamento Hierárquico, K-Means,
 * Regressão Logística Não Linear, Modelos Lineares grandes) em thread separada
 * para manter a interface fluida mesmo offline.
 */

import { runPcaAnalysis, runHierarchicalClustering, runKMeansClustering } from '../multivariate/multivariateEngine';
import { runAnova } from '../anova/anovaEngine';
import { runRegressionAnalysis } from '../regression/regressionEngine';

export interface WorkerStatsRequest {
  requestId: string;
  task: 'pca' | 'cluster_hier' | 'kmeans' | 'anova' | 'regression';
  payload: any;
}

export interface WorkerStatsResponse {
  requestId: string;
  ok: boolean;
  result?: any;
  error?: string;
}

if (typeof self !== 'undefined' && typeof (self as any).postMessage === 'function' && typeof window === 'undefined') {
  self.onmessage = (ev: MessageEvent<WorkerStatsRequest>) => {
    const { requestId, task, payload } = ev.data;
    try {
      let result: any;
      if (task === 'pca') result = runPcaAnalysis(payload);
      else if (task === 'cluster_hier') result = runHierarchicalClustering(payload);
      else if (task === 'kmeans') result = runKMeansClustering(payload);
      else if (task === 'anova') result = runAnova(payload);
      else if (task === 'regression') result = runRegressionAnalysis(payload);
      else throw new Error(`Tarefa estatística desconhecida: ${task}`);

      const msg: WorkerStatsResponse = { requestId, ok: true, result };
      (self as any).postMessage(msg);
    } catch (err: any) {
      const msg: WorkerStatsResponse = {
        requestId,
        ok: false,
        error: err?.message || String(err),
      };
      (self as any).postMessage(msg);
    }
  };
}

/**
 * Helper seguro que tenta rodar em Web Worker e usa execução local assíncrona como fallback transparente
 * (útil em testes Vitest/jsdom ou navegadores restritos).
 */
export async function executeInStatsWorker<T = any>(
  task: WorkerStatsRequest['task'],
  payload: any,
  signal?: AbortSignal
): Promise<T> {
  const localExecute = (): T => {
    if (task === 'pca') return runPcaAnalysis(payload) as unknown as T;
    if (task === 'cluster_hier') return runHierarchicalClustering(payload) as unknown as T;
    if (task === 'kmeans') return runKMeansClustering(payload) as unknown as T;
    if (task === 'anova') return runAnova(payload) as unknown as T;
    if (task === 'regression') return runRegressionAnalysis(payload) as unknown as T;
    throw new Error(`Tarefa desconhecida: ${task}`);
  };

  if (typeof Worker === 'undefined' || typeof window === 'undefined') {
    if (signal?.aborted) throw new Error('Processamento cancelado pelo usuário.');
    return localExecute();
  }

  return new Promise<T>((resolve, reject) => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL('./statisticsWorker.ts', import.meta.url), { type: 'module' });
    } catch {
      try {
        resolve(localExecute());
      } catch (e) {
        reject(e);
      }
      return;
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanup = () => {
      try {
        worker?.terminate();
      } catch {}
    };

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          cleanup();
          reject(new Error('Análise cancelada pelo usuário.'));
        },
        { once: true }
      );
    }

    worker.onmessage = (ev: MessageEvent<WorkerStatsResponse>) => {
      if (ev.data.requestId !== requestId) return;
      cleanup();
      if (ev.data.ok) resolve(ev.data.result as T);
      else reject(new Error(ev.data.error || 'Erro no Web Worker estatístico.'));
    };

    worker.onerror = () => {
      cleanup();
      try {
        resolve(localExecute());
      } catch (e) {
        reject(e);
      }
    };

    worker.postMessage({ requestId, task, payload } satisfies WorkerStatsRequest);
  });
}
