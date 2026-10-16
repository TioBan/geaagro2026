import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Bug,
  Sparkles,
  Trash2,
  CheckCheck,
  Settings,
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Smartphone,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  AgronomicNotification,
  NotificationPreferences,
  getNotificationHistory,
  getNotificationPreferences,
  updateNotificationPreferences,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  requestNotificationPermission,
  getNotificationPermission
} from '../utils/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, subTab?: string, extraData?: any) => void;
  activeFarmName?: string;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activeFarmName = 'Fazenda Modelo',
}) => {
  const [notifications, setNotifications] = useState<AgronomicNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(getNotificationPreferences());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeFilter, setActiveFilter] = useState<'all' | 'task_pending' | 'report_finalized' | 'pest_alert'>('all');
  const [activeView, setActiveView] = useState<'list' | 'settings'>('list');

  // Load notifications and permissions
  const refreshData = () => {
    setNotifications(getNotificationHistory());
    setPreferences(getNotificationPreferences());
    setPermission(getNotificationPermission());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Listen for custom notification events
  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('geaagro-notification-received', handleUpdate);
    window.addEventListener('geaagro-notification-updated', handleUpdate);
    return () => {
      window.removeEventListener('geaagro-notification-received', handleUpdate);
      window.removeEventListener('geaagro-notification-updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    refreshData();
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = updateNotificationPreferences({ [key]: !preferences[key] });
    setPreferences(updated);
  };

  const handleNotificationClick = (item: AgronomicNotification) => {
    markNotificationAsRead(item.id);
    refreshData();
    onClose();

    if (item.data?.tab) {
      onNavigate(item.data.tab, item.data.subTab, item.data);
    }
  };

  const filteredNotifications = (notifications || []).filter(n => {
    if (!n) return false;
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = (notifications || []).filter(n => n && !n.read).length;

  const formatTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'report_finalized':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'pest_alert':
        return <Bug className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Central de Notificação</span>

              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Alertas em tempo real sobre laudos finalizados e tarefas de campo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView(prev => prev === 'list' ? 'settings' : 'list')}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center ${
                activeView === 'settings'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title={activeView === 'settings' ? 'Ver Notificações' : 'Configurar Alertas'}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              title="Fechar"
              aria-label="Fechar central de notificações"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Permission Status Banner */}
        {permission !== 'granted' && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {permission === 'denied' 
                  ? 'Notificações bloqueadas pelo navegador. Permita nas configurações do site.'
                  : 'Ative as notificações para ser avisado sobre novos laudos e prazos no campo.'}
              </span>
            </div>
            {permission !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Permitir Notificações
              </button>
            )}
          </div>
        )}

        {/* View Mode: List of Notifications */}
        {activeView === 'list' && (
          <>
            {/* Filter Tabs & Quick Actions */}
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/40 dark:bg-zinc-900/20 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveFilter('task_pending')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                    activeFilter === 'task_pending'
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  Tarefas
                </button>
                <button
                  onClick={() => setActiveFilter('report_finalized')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                    activeFilter === 'report_finalized'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  Laudos
                </button>
                <button
                  onClick={() => setActiveFilter('pest_alert')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                    activeFilter === 'pest_alert'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  Alertas IA
                </button>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Ler todas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotificationHistory}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Limpar histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Notification Items Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-zinc-800/40">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
                  <BellOff className="w-10 h-10 mx-auto stroke-1 opacity-60" />
                  <p className="text-sm font-medium">Nenhuma notificação encontrada no momento.</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Você receberá alertas automáticos quando novos laudos técnicos forem emitidos ou tarefas do Caderno de Campo estiverem pendentes.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`pt-2.5 first:pt-0 p-3 rounded-xl transition-all cursor-pointer group ${
                      !item.read
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs shrink-0 mt-0.5">
                          {getIcon(item.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold ${!item.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                              {item.title}
                            </h4>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                            <span>{formatTime(item.timestamp)}</span>
                            {item.data?.farmName && (
                              <span>• {item.data.farmName}</span>
                            )}
                            {item.data?.tab && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 group-hover:underline">
                                Clique para abrir <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* View Mode: Push Settings */}
        {activeView === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Preferências de Notificação Push
              </h4>
              <p className="text-slate-500 dark:text-zinc-400">
                Personalize quais eventos agronômicos geram alertas no seu dispositivo.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Notificações Gerais Habilitadas</span>
                  <span className="text-slate-400 text-[11px]">Ativar ou pausar todos os alertas push do GeaAgro.</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={() => handleTogglePref('enabled')}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Alertas de Tarefas Pendentes</span>
                  <span className="text-slate-400 text-[11px]">Lembretes de pulverizações, adubações e operações do Caderno de Campo.</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pendingTasks}
                  onChange={() => handleTogglePref('pendingTasks')}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Novos Laudos Técnicos Finalizados</span>
                  <span className="text-slate-400 text-[11px]">Aviso imediato quando um laudo oficial for gerado com ART e pronto para PDF.</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newReports}
                  onChange={() => handleTogglePref('newReports')}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">Alertas Fitossanitários & Nema IA</span>
                  <span className="text-slate-400 text-[11px]">Alertas sobre pressão crítica de pragas, nematoides e doenças.</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pestAlerts}
                  onChange={() => handleTogglePref('pestAlerts')}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Sons de Alerta</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={() => handleTogglePref('soundEnabled')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Vibração</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.vibrationEnabled}
                    onChange={() => handleTogglePref('vibrationEnabled')}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${permission === 'granted' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-[11px] font-semibold">
              Status: {permission === 'granted' ? 'Ativo (Permitido)' : permission === 'denied' ? 'Bloqueado' : 'Aguardando Permissão'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
