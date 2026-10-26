import { useState, useEffect, useCallback, useRef } from 'react';

export interface AppUpdateState {
  updateAvailable: boolean;
  isChecking: boolean;
  isUpToDate: boolean;
  lastChecked: Date | null;
  updateDeferred: boolean;
  registration: ServiceWorkerRegistration | null;
  swWaiting: ServiceWorker | null;
  currentVersion: string;
}

const CURRENT_VERSION = '4.2.3.4';
const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpToDate, setIsUpToDate] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [updateDeferred, setUpdateDeferred] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swWaiting, setSwWaiting] = useState<ServiceWorker | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  // Ref de segurança para garantir que a página SÓ seja recarregada se o usuário clicar expressamente em "Atualizar Agora"
  const userApprovedUpdateRef = useRef<boolean>(false);

  // Manipulador para registrar listeners no Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let isMounted = true;

    const handleRegistration = (reg: ServiceWorkerRegistration) => {
      if (!isMounted) return;
      setRegistration(reg);

      // 1. Caso o Service Worker já esteja aguardando (waiting)
      if (reg.waiting) {
        console.log('[AppUpdate] Novo Service Worker em estado de espera (waiting). Aguardando autorização do usuário.');
        setSwWaiting(reg.waiting);
        setUpdateAvailable(true);
      }

      // 2. Escutar quando um novo SW for encontrado e instalado (updatefound)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          // O Service Worker foi instalado em segundo plano, mas NÃO força atualização nem abre popup sem solicitação expressa do usuário
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[AppUpdate] Nova versão disponível em segundo plano. Não exibindo popup intrusivo conforme preferência do usuário.');
            if (isMounted) {
              setSwWaiting(newWorker);
              setUpdateAvailable(true);
              // Não abre popup automático (respeitando escolha do usuário)
            }
          }
        });
      });
    };

    // Obter registration ativo
    navigator.serviceWorker.ready.then(handleRegistration).catch((err) => {
      console.warn('[AppUpdate] Erro ao obter ServiceWorkerRegistration:', err);
    });

    // Listener para quando o controller mudar (quando o SW for ativado via SKIP_WAITING)
    let refreshing = false;
    const handleControllerChange = () => {
      // REGRA DE SEGURANÇA E CONSENTIMENTO:
      // O aplicativo APENAS recarrega a página se o usuário clicou expressamente em "Atualizar Agora"!
      if (userApprovedUpdateRef.current && !refreshing) {
        refreshing = true;
        console.log('[AppUpdate] Atualização confirmada pelo usuário. Recarregando aplicação...');
        window.location.reload();
      } else {
        console.log('[AppUpdate] Troca de controlador detectada mas ignorada porque o usuário NÃO deu consentimento para atualizar.');
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      isMounted = false;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  // Função para verificar atualizações manualmente ou periodicamente
  const checkForUpdates = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    setIsChecking(true);
    setIsUpToDate(false);

    try {
      const reg = await navigator.serviceWorker.ready;
      setRegistration(reg);
      setLastChecked(new Date());

      // Tentar buscar atualização no service worker (sem forçar ativasão)
      await reg.update();

      if (reg.waiting) {
        setSwWaiting(reg.waiting);
        setUpdateAvailable(true);
        setIsChecking(false);
        return true;
      }

      // Se não encontrou nenhuma atualização aguardando
      setTimeout(() => {
        setIsChecking(false);
        if (!reg.waiting && !updateAvailable) {
          setIsUpToDate(true);
          setTimeout(() => setIsUpToDate(false), 4000);
        }
      }, 800);

      return false;
    } catch (error) {
      console.warn('[AppUpdate] Falha ao verificar atualizações:', error);
      setIsChecking(false);
      return false;
    }
  }, [updateAvailable]);

  // Intervalo automático de verificação (a cada 15 min quando online)
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkForUpdates();
      }
    }, UPDATE_CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        checkForUpdates();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  // Função para aplicar a atualização expressamente autorizada pelo usuário
  const applyUpdate = useCallback(() => {
    console.log('[AppUpdate] Consentimento confirmado pelo usuário. Enviando SKIP_WAITING ao Service Worker...');
    userApprovedUpdateRef.current = true;

    if (swWaiting) {
      swWaiting.postMessage({ type: 'SKIP_WAITING' });
    } else if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Recarrega somente quando o usuário clicou no botão "Atualizar Agora"
      window.location.reload();
    }
    setShowUpdateModal(false);
  }, [swWaiting, registration]);

  // Função para adiar a atualização (respeitar decisão do usuário)
  const deferUpdate = useCallback(() => {
    console.log('[AppUpdate] Usuário optou por adiar a atualização.');
    setUpdateDeferred(true);
    setShowUpdateModal(false);
  }, []);

  const openUpdateModal = useCallback(() => {
    setShowUpdateModal(true);
  }, []);

  return {
    updateAvailable,
    isChecking,
    isUpToDate,
    lastChecked,
    updateDeferred,
    showUpdateModal,
    currentVersion: CURRENT_VERSION,
    checkForUpdates,
    applyUpdate,
    deferUpdate,
    openUpdateModal,
    setShowUpdateModal,
  };
}
