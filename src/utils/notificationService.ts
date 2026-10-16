export type NotificationType = 
  | 'task_pending' 
  | 'report_finalized' 
  | 'pest_alert' 
  | 'weather_window' 
  | 'general';

export interface AgronomicNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: {
    tab?: string;
    subTab?: string;
    reportNumber?: string;
    taskId?: string;
    farmId?: string;
    farmName?: string;
    plotName?: string;
    cropName?: string;
    url?: string;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  pendingTasks: boolean;
  newReports: boolean;
  pestAlerts: boolean;
  weatherWindows: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'geaagro_notifications_history';
const STORAGE_KEY_PREFERENCES = 'geaagro_notification_preferences';
const STORAGE_KEY_LAST_CHECK = 'geaagro_tasks_last_check_date';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  pendingTasks: true,
  newReports: true,
  pestAlerts: true,
  weatherWindows: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

// Check if Push & Notification API is supported
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current permission state
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request permission to send Push Notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notification] Browser does not support notifications.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    console.log(`[Push Notification] Permission status: ${permission}`);
    
    if (granted) {
      // Send welcome / confirmation push notification via SW
      await dispatchSWNotification(
        '🔔 Notificações Ativadas no GeaAgro!',
        {
          body: 'Você receberá alertas em tempo real sobre tarefas pendentes de campo e laudos técnicos prontos.',
          icon: '/favicon.svg',
          tag: 'geaagro-welcome',
          data: { tab: 'dashboard' }
        },
        {
          type: 'general',
          priority: 'medium',
          title: 'Notificações Ativadas',
          message: 'Alertas push configurados com sucesso para tarefas e relatórios.'
        }
      );
    }
    return granted;
  } catch (error) {
    console.error('[Push Notification] Error requesting permission:', error);
    return false;
  }
}

// Low-level dispatch to Service Worker showNotification
export async function dispatchSWNotification(
  title: string,
  options: any = {},
  internalMeta?: Partial<AgronomicNotification>
): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  const prefs = getNotificationPreferences();
  if (!prefs.enabled && internalMeta?.type !== 'general') {
    console.log('[Push Notification] Notifications disabled by user preference.');
    return false;
  }

  // Create internal notification record
  const newNotification: AgronomicNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: internalMeta?.type || 'general',
    title: internalMeta?.title || title,
    message: internalMeta?.message || (typeof options.body === 'string' ? options.body : 'Novo alerta agronômico.'),
    timestamp: Date.now(),
    read: false,
    priority: internalMeta?.priority || 'medium',
    data: internalMeta?.data || (options.data as any) || { tab: 'dashboard' },
  };

  // Save to history
  saveNotificationToHistory(newNotification);

  // Trigger UI custom event for badge counter updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geaagro-notification-received', { detail: newNotification }));
  }

  // Audio cue if enabled
  if (prefs.soundEnabled && typeof Audio !== 'undefined') {
    try {
      // Soft synthetic notification beep using Web Audio API
      playNotificationAudio();
    } catch {
      // Ignore audio failure
    }
  }

  // If permission is not granted, only store in internal history
  if (Notification.permission !== 'granted') {
    console.log('[Push Notification] Permission not granted, saved to in-app center.');
    return false;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    if (swRegistration && 'showNotification' in swRegistration) {
      await (swRegistration as any).showNotification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: prefs.vibrationEnabled ? [200, 100, 200] : undefined,
        ...options,
      });
      return true;
    } else {
      // Fallback to Window Notification API if SW ready fails
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.svg',
        tag: options.tag,
        data: options.data,
      });
      return true;
    }
  } catch (err) {
    console.warn('[Push Notification] Failed to display system notification:', err);
    try {
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.svg',
        tag: options.tag,
        data: options.data,
      });
      return true;
    } catch {
      return false;
    }
  }
}


// Generate soft notification tone with Web Audio API
function playNotificationAudio() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be blocked before user interaction
  }
}

// Notify: Finalized Technical Report
export async function notifyTechnicalReportFinalized(report: {
  farmName: string;
  cropName: string;
  agronomistName?: string;
  reportNumber?: string;
  plotName?: string;
  yieldTarget?: number;
}): Promise<boolean> {
  const prefs = getNotificationPreferences();
  if (!prefs.newReports) return false;

  const title = '📄 Novo Laudo Técnico Finalizado!';
  const reportCode = report.reportNumber ? ` (${report.reportNumber})` : '';
  const body = `Laudo oficial${reportCode} para ${report.farmName} • ${report.cropName} foi calculado e emitido com sucesso com ART.`;

  return dispatchSWNotification(
    title,
    {
      body,
      tag: `report-${report.reportNumber || Date.now()}`,
      data: {
        tab: 'relatorios',
        reportNumber: report.reportNumber,
        farmName: report.farmName,
        cropName: report.cropName,
      },
      actions: [
        { action: 'open_reports', title: 'Ver Laudo Oficial' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    },
    {
      type: 'report_finalized',
      priority: 'high',
      title: 'Laudo Técnico Oficial Emitido',
      message: body,
      data: {
        tab: 'relatorios',
        reportNumber: report.reportNumber,
        farmName: report.farmName,
        cropName: report.cropName,
      }
    }
  );
}

// Notify: Pending Agronomic Field Tasks
export async function notifyPendingTask(task: {
  title: string;
  farmName?: string;
  fieldName?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  taskId?: string;
  status?: string;
}): Promise<boolean> {
  const prefs = getNotificationPreferences();
  if (!prefs.pendingTasks) return false;

  const priorityLabel = task.priority === 'high' ? '🚨 URGENTE: ' : '⚠️ ';
  const location = task.fieldName ? ` no ${task.fieldName}` : '';
  const farm = task.farmName ? ` (${task.farmName})` : '';
  const title = `${priorityLabel}Tarefa Agronômica Pendente`;
  const body = `"${task.title}"${location}${farm} requer atenção operacional ou validação no Caderno de Campo.`;

  return dispatchSWNotification(
    title,
    {
      body,
      tag: `task-${task.taskId || Date.now()}`,
      data: {
        tab: 'fieldbook',
        subTab: 'operations',
        taskId: task.taskId,
        farmName: task.farmName,
      },
      actions: [
        { action: 'open_fieldbook', title: 'Abrir Operações' },
        { action: 'dismiss', title: 'Fechar' }
      ]
    },
    {
      type: 'task_pending',
      priority: task.priority || 'medium',
      title: `Operação Pendente: ${task.title}`,
      message: body,
      data: {
        tab: 'fieldbook',
        subTab: 'operations',
        taskId: task.taskId,
        farmName: task.farmName,
      }
    }
  );
}

// Notify: Critical Pest / Nematode Alert
export async function notifyPestAlert(alert: {
  pestName: string;
  farmName: string;
  plotName?: string;
  severity: 'Crítica' | 'Alta' | 'Moderada' | 'Baixa';
}): Promise<boolean> {
  const prefs = getNotificationPreferences();
  if (!prefs.pestAlerts) return false;

  const title = `🚨 Alerta Fitossanitário - ${alert.severity}`;
  const plot = alert.plotName ? ` no ${alert.plotName}` : '';
  const body = `Pressão detectada de ${alert.pestName}${plot} (${alert.farmName}). Verifique o diagnóstico Nema IA e planeje o manejo.`;

  return dispatchSWNotification(
    title,
    {
      body,
      tag: `pest-${Date.now()}`,
      data: {
        tab: 'nema_ai',
        farmName: alert.farmName,
      },
      actions: [
        { action: 'open_nema_ai', title: 'Ver Diagnóstico IA' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    },
    {
      type: 'pest_alert',
      priority: alert.severity === 'Crítica' || alert.severity === 'Alta' ? 'high' : 'medium',
      title: `Alerta: ${alert.pestName}`,
      message: body,
      data: {
        tab: 'nema_ai',
        farmName: alert.farmName,
      }
    }
  );
}

// Check and automatically notify overdue or today's tasks
export function checkAndNotifyDueTasks(operations: any[], farmName?: string): number {
  if (!operations || operations.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastCheckStr = localStorage.getItem(STORAGE_KEY_LAST_CHECK);

  // Only run automatic bulk check once per day to prevent spamming
  if (lastCheckStr === todayStr) {
    return 0;
  }

  const pendingOps = operations.filter(op => 
    (op.status === 'planned' || op.status === 'in_progress') &&
    op.date &&
    op.date <= todayStr
  );

  if (pendingOps.length > 0) {
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, todayStr);
    
    // Dispatch consolidated task alert
    const urgentCount = pendingOps.length;
    const firstOp = pendingOps[0];
    const opTypeName = getOperationTypeLabel(firstOp.type);

    dispatchSWNotification(
      `⚠️ ${urgentCount} ${urgentCount === 1 ? 'Tarefa Pendente Hoje' : 'Tarefas Pendentes no Campo'}`,
      {
        body: `Ex: ${opTypeName} agendada para hoje${farmName ? ` em ${farmName}` : ''}. Clique para revisar o plano de ação.`,
        tag: `bulk-tasks-${todayStr}`,
        data: {
          tab: 'fieldbook',
          subTab: 'operations'
        }
      },
      {
        type: 'task_pending',
        priority: 'high',
        title: `${urgentCount} Tarefas Pendentes para Hoje`,
        message: `Existem ${urgentCount} operações no Caderno de Campo com prazo para hoje ou em atraso.`,
        data: { tab: 'fieldbook', subTab: 'operations' }
      }
    );
  }

  return pendingOps.length;
}

function getOperationTypeLabel(type: string): string {
  switch (type) {
    case 'spraying': return 'Aplicação de Defensivos / Calda';
    case 'fertility': return 'Adubação de Cobertura';
    case 'planting': return 'Semeadura / Plantio';
    case 'soil_prep': return 'Preparo de Solo';
    case 'irrigation': return 'Manejo de Irrigação';
    case 'monitoring': return 'Monitoramento Fitossanitário';
    case 'harvest': return 'Colheita';
    default: return 'Operação Agronômica';
  }
}

// Local Storage Notification History Management
export function getNotificationHistory(): AgronomicNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n): n is AgronomicNotification => Boolean(n && typeof n === 'object' && n.id));
    }
    return [];
  } catch {
    return [];
  }
}

export function saveNotificationToHistory(notification: AgronomicNotification): void {
  if (typeof window === 'undefined' || !notification || !notification.id) return;
  try {
    const history = getNotificationHistory();
    // Keep last 50 notifications
    const updated = [notification, ...history.filter(n => n && n.id && n.id !== notification.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save notification history:', err);
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const history = getNotificationHistory();
    const updated = history.map(n => (n && n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('geaagro-notification-updated'));
  } catch (err) {
    console.warn('Failed to update notification:', err);
  }
}

export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getNotificationHistory();
    const updated = history.map(n => (n ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('geaagro-notification-updated'));
  } catch (err) {
    console.warn('Failed to mark all as read:', err);
  }
}

export function clearNotificationHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    window.dispatchEvent(new CustomEvent('geaagro-notification-updated'));
  } catch (err) {
    console.warn('Failed to clear notifications:', err);
  }
}

// User Preferences Management
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function updateNotificationPreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
