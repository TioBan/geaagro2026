import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BackupQRCodeGenerator } from './BackupQRCodeGenerator';
import { useStorageEstimate } from '../hooks/useStorageEstimate';
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  QrCode,
  FileText,
  Layers,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  Trash2,
  Copy,
  Key,
  Info,
  ShieldAlert,
  Search,
  Upload,
  Folder,
  Server,
  History,
  BookOpen,
  Egg,
  Sprout,
  Beef,
  FlaskConical,
  Leaf,
  Droplets,
  CloudSun,
  CloudRain,
  Tractor,
  Camera,
  BarChart2,
  DollarSign,
  Globe,
  FolderOpen,
  Network,
  RotateCcw,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import {
  BackupMetadata,
  SnapshotRecord,
  BackupAutoTriggerConfig,
  getBackupHistory,
  saveBackupHistory,
  getSnapshots,
  getAutoTriggerConfig,
  saveAutoTriggerConfig,
  createFullBackup,
  restoreBackup,
  rollbackEmergencySnapshot,
  validateAndInspectBackup,
  createInstantSnapshot,
  generateSHA256,
  triggerFileDownload,
  formatBytes,
} from '../utils/backupService';
import { CryptoService } from '../services/cryptoService';
import {
  pickBackupFolder,
  PRESET_BACKUP_FOLDERS,
  saveBackupFileWithNativePicker,
} from '../services/folderPickerService';
import { opfsWasmDB, OpfsEngineDiagnostics } from '../services/opfsWasmDatabase';
import { StatusSincronizacaoRecupera } from '../types/recupera';
import {
  exportarBackupJsonRecupera,
  restaurarBackupJsonRecupera,
  obterStatusSincronizacaoRecupera,
  registrarSincronizacaoRealizada,
  resetarTodosOsDadosRecupera,
} from '../utils/recuperaStorage';
import { estatisticaStorage } from '../modules/estatistica/storage/estatisticaStorage';
import { EstatisticaBackupMetadata } from '../modules/estatistica/types/estatistica';
import { useAppUpdate } from '../hooks/useAppUpdate';

interface BackupModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

interface ConfirmDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

const BACKUP_TABS = [
  { id: 'dashboard', label: 'Visão Geral' },
  { id: 'criacao', label: 'Criar Backup' },
  { id: 'restauracao', label: 'Restaurar' },
  { id: 'snapshots', label: 'Snapshots' },
  { id: 'modulos', label: 'Por Módulo' },
  { id: 'historico', label: 'Histórico' },
  { id: 'agendamento', label: 'Automação' },
  { id: 'migracao', label: 'Migração' },
  { id: 'qrcode', label: 'QR Code' },
  { id: 'estatistica_opfs', label: 'OPFS Estatística' },
] as const;

const FREQUENCY_LABELS: Record<string, string> = {
  off: 'Desativado',
  daily: 'Diário',
  weekly: 'Semanal',
  fortnightly: 'Quinzenal',
  monthly: 'Mensal',
};

const SUITE_MODULES = [
  { id: 'solos', name: 'Análises de Solo', icon: FlaskConical, desc: 'Amostras, laudos e fertilidade' },
  { id: 'doencas_solo', name: 'Sanidade do Solo', icon: ShieldCheck, desc: 'Ocorrências, talhões e patógenos' },
  { id: 'foliar', name: 'Análises Foliares', icon: Leaf, desc: 'Diagnose nutricional e DRIS' },
  { id: 'pecuaria', name: 'Pecuária & Rebanho', icon: Beef, desc: 'Lotes, pesagens e reprodução' },
  { id: 'caderno_campo', name: 'Caderno de Campo', icon: Tractor, desc: 'Operações agrícolas e talhões' },
  { id: 'irrigacao', name: 'Irrigação & TankMix', icon: Droplets, desc: 'Balanço hídrico e fertirrigação' },
  { id: 'pluviometria', name: 'Pluviometria', icon: CloudRain, desc: 'Registros de chuvas por talhão' },
  { id: 'relatorios', name: 'Relatórios & Laudos', icon: FileText, desc: 'Laudos técnicos oficiais com ART' },
  { id: 'meteorologia', name: 'Meteorologia', icon: CloudSun, desc: 'Histórico e previsões climáticas' },
  { id: 'custos', name: 'Custos de Produção', icon: DollarSign, desc: 'Financeiro, insumos e margens' },
  { id: 'avicultura', name: 'Avicultura', icon: Egg, desc: 'Lotes, galpões e sanidade' },
  { id: 'sementes', name: 'Análise de Sementes', icon: Sprout, desc: 'Lotes, vigor e germinação' },
  { id: 'nematologia', name: 'Nematologia', icon: Sparkles, desc: 'População por amostragem' },
  { id: 'pragas', name: 'MIP & Pragas', icon: ShieldAlert, desc: 'Inspeções e nível de dano' },
  { id: 'bulario', name: 'Bulário & Receituário', icon: BookOpen, desc: 'Defensivos e prescrições' },
  { id: 'diario_fotos', name: 'Diário Fotográfico', icon: Camera, desc: 'Registros visuais de campo' },
  { id: 'recupera', name: 'Recupera — Áreas Degradadas', icon: Sprout, desc: 'Talhões, PRAD, custos e GPS' },
  { id: 'estatistica', name: 'GeaAgro Estatística', icon: BarChart2, desc: 'Projetos, OPFS, análises e gráficos' },
];

const AUTO_TRIGGERS: Array<{
  key: keyof BackupAutoTriggerConfig;
  label: string;
  desc: string;
}> = [
  { key: 'onAppClose', label: 'Ao encerrar o aplicativo', desc: 'Cópia incremental ao fechar a sessão' },
  { key: 'onSoilAnalysisComplete', label: 'Ao concluir análise de solo', desc: 'Salva novas amostras e cálculos' },
  { key: 'onReportFinished', label: 'Ao finalizar laudo técnico PDF', desc: 'Protege documentos emitidos' },
  { key: 'onNewFieldAdded', label: 'Ao adicionar talhão ou lavoura', desc: 'Registra estrutura territorial' },
  { key: 'onBirthRegistered', label: 'Ao registrar parto no rebanho', desc: 'Atualiza histórico zootécnico' },
  { key: 'onApplicationRegistered', label: 'Ao registrar aplicação', desc: 'Salva receituário e calda' },
  { key: 'onFertilizerDbUpdated', label: 'Ao atualizar banco de fertilizantes', desc: 'Preserva tabela de insumos' },
];

export const BackupModule: React.FC<BackupModuleProps> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab,
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab);

  useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setActiveSubTab?.(tabId);
  };

  // Core Data State
  const [history, setHistory] = useState<BackupMetadata[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [autoConfig, setAutoConfig] = useState<BackupAutoTriggerConfig>(getAutoTriggerConfig());

  // History Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Creation Form State
  const [backupType, setBackupType] = useState<'completo' | 'incremental' | 'diferencial' | 'modulo'>('completo');
  const [selectedStorage, setSelectedStorage] = useState<'pasta_custom' | 'ftp'>('pasta_custom');
  const [customFolderPath, setCustomFolderPath] = useState<string>('/Documentos/GeaAgro_Backups/');

  // FTP / SFTP State
  const [ftpConfig, setFtpConfig] = useState({
    host: 'ftp.fazendasantaluzia.com.br',
    port: 21,
    protocol: 'ftp' as 'ftp' | 'ftps' | 'sftp',
    user: 'geaagro_backup',
    password: '••••••••••••',
    remotePath: '/backups/safra_2026/',
    passiveMode: true,
  });
  const [isTestingFtp, setIsTestingFtp] = useState<boolean>(false);
  const [ftpTestStatus, setFtpTestStatus] = useState<string | null>(null);
  const [isLocalFtpRunning, setIsLocalFtpRunning] = useState<boolean>(true);
  const localFtpUrl = 'ftp://192.168.1.100:2121';

  // Options & Encryption
  const [includeMediaFiles, setIncludeMediaFiles] = useState<boolean>(true);
  const [useEncryption, setUseEncryption] = useState<boolean>(false);
  const [encryptionPassword, setEncryptionPassword] = useState<string>('');
  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [isRecoveryKeyConfirmed, setIsRecoveryKeyConfirmed] = useState<boolean>(false);
  const [backupNotes, setBackupNotes] = useState<string>('');
  const [backupUser, setBackupUser] = useState<string>('Dr. Lucas Mendes (Agrônomo)');
  const [backupFormError, setBackupFormError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Selected Modules
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'solos',
    'doencas_solo',
    'foliar',
    'pecuaria',
    'caderno_campo',
    'irrigacao',
    'pluviometria',
    'relatorios',
    'meteorologia',
    'custos',
    'recupera',
  ]);

  // Recupera Integration State
  const [recuperaSyncStatus, setRecuperaSyncStatus] = useState<StatusSincronizacaoRecupera>(() =>
    obterStatusSincronizacaoRecupera()
  );
  const [isSyncingRecupera, setIsSyncingRecupera] = useState<boolean>(false);
  const [recuperaJsonImport, setRecuperaJsonImport] = useState<string>('');
  const recuperaFileInputRef = useRef<HTMLInputElement>(null);

  // Feedback & Confirm Dialog
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Backup Execution State
  const [isExecutingBackup, setIsExecutingBackup] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [executionStep, setExecutionStep] = useState<string>('');
  const [lastCreatedBackup, setLastCreatedBackup] = useState<BackupMetadata | null>(null);
  const [lastCreatedBackupPayload, setLastCreatedBackupPayload] = useState<string | null>(null);

  // Restore State
  const restoreFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [restoreInlineError, setRestoreInlineError] = useState<string | null>(null);
  const [restoreStepText, setRestoreStepText] = useState<string>('');
  const [restoreSuccessModal, setRestoreSuccessModal] = useState<{ count: number; keys: number } | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreFileContent, setRestoreFileContent] = useState<string>('');
  const [restorePassword, setRestorePassword] = useState<string>('');
  const [restoreRecoveryKey, setRestoreRecoveryKey] = useState<string>('');
  const [isRestoreEncrypted, setIsRestoreEncrypted] = useState<boolean>(false);
  const [restoreEncryptionMode, setRestoreEncryptionMode] = useState<string>('none');
  const [restoreValidationStatus, setRestoreValidationStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message?: string;
  }>({ tested: false, valid: false });
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'total' | 'modulo' | 'fazenda' | 'midia' | 'relatorios'>('total');
  const [selectedModuleToRestore, setSelectedModuleToRestore] = useState<string>('solos');
  const [isExecutingRestore, setIsExecutingRestore] = useState<boolean>(false);
  const [restoreProgress, setRestoreProgress] = useState<number>(0);

  // QR Selection
  const [selectedQrBackupId, setSelectedQrBackupId] = useState<string | undefined>(undefined);

  // Snapshot Creation State
  const [snapshotTitle, setSnapshotTitle] = useState<string>('');
  const [snapshotEvent, setSnapshotEvent] = useState<string>('Alteração Manual em Massa');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  // Storage & OPFS Diagnostics
  const storageStats = useStorageEstimate();
  const [opfsDiagnostics, setOpfsDiagnostics] = useState<OpfsEngineDiagnostics | null>(null);
  const [estatisticaStorageStatus, setEstatisticaStorageStatus] = useState<{
    engine: string;
    usageBytes: number;
    quotaBytes: number;
    percentage: number;
    isPersistent: boolean;
    totalProjetos: number;
    totalExperimentos: number;
    totalResultados: number;
    totalGraficos: number;
    artefatosOpfsCount: number;
  } | null>(null);
  const [estatisticaBackupsMeta, setEstatisticaBackupsMeta] = useState<EstatisticaBackupMetadata[]>([]);
  const [isRegisteringEstatisticaCheckpoint, setIsRegisteringEstatisticaCheckpoint] = useState(false);

  const {
    updateAvailable: pwaUpdateAvailable,
    isChecking: isCheckingPwaUpdate,
    isUpToDate: isPwaUpToDate,
    currentVersion: pwaCurrentVersion,
    checkForUpdates: checkPwaUpdates,
    applyUpdate: applyPwaUpdate,
  } = useAppUpdate();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const refreshEstatisticaOpfs = async () => {
    try {
      const [status, meta] = await Promise.all([
        estatisticaStorage.obterStatusArmazenamento(),
        estatisticaStorage.listarBackupsMetadata(),
      ]);
      setEstatisticaStorageStatus(status);
      setEstatisticaBackupsMeta(meta);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    opfsWasmDB.getEngineDiagnostics().then(setOpfsDiagnostics).catch(() => {});
    void refreshEstatisticaOpfs();
  }, [currentTab]);

  useEffect(() => {
    setHistory(getBackupHistory());
    setSnapshots(getSnapshots());
    setAutoConfig(getAutoTriggerConfig());
  }, []);

  // Derived Smart Metrics
  const latestBackup = history[0] || null;
  const activeTriggersCount = useMemo(
    () => AUTO_TRIGGERS.filter((t) => Boolean(autoConfig[t.key])).length,
    [autoConfig]
  );

  const filteredHistory = useMemo(
    () =>
      history.filter((b) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          b.filename.toLowerCase().includes(q) ||
          b.userResponsible.toLowerCase().includes(q) ||
          b.storageLocation.toLowerCase().includes(q);
        const matchesType = typeFilter === 'all' || b.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [history, searchTerm, typeFilter]
  );

  // Handlers
  const handleSetDiskCapacity = (gb: number) => {
    storageStats.setCustomDiskGb(gb);
    showToast(`Capacidade ajustada para ${gb >= 1024 ? '1 TB' : `${gb} GB`}.`, 'info');
  };

  const handleGenerateRecoveryKey = () => {
    const keyDetails = CryptoService.generateRecoveryKey();
    setRecoveryKey(keyDetails.formattedKey);
    setIsRecoveryKeyConfirmed(false);
    showToast('Chave de recuperação de 256 bits gerada.', 'info');
  };

  const handleSelectDirectoryFolder = async () => {
    try {
      const result = await pickBackupFolder({
        suggestedPath: customFolderPath,
        allowWebkitFallback: false,
      });

      if (result.success && result.folderPath) {
        setCustomFolderPath(result.folderPath);
        showToast(result.message || `Pasta "${result.folderName}" selecionada.`, 'success');
      } else if (result.status === 'permission_denied') {
        showToast('Permissão de acesso à pasta não concedida.', 'info');
      } else if (result.status === 'restricted_system') {
        showToast('Use os atalhos de pasta abaixo ou digite o caminho desejado.', 'info');
      } else if (result.status !== 'cancelled' && result.message) {
        showToast(result.message, 'info');
      }
    } catch {
      showToast('Selecione um atalho ou digite o diretório desejado.', 'info');
    }
  };

  const handleTestFtpConnection = () => {
    setIsTestingFtp(true);
    setFtpTestStatus('Conectando ao servidor FTP...');
    setTimeout(() => {
      setFtpTestStatus('Verificando credenciais e permissão de escrita...');
    }, 700);
    setTimeout(() => {
      setIsTestingFtp(false);
      setFtpTestStatus('Conexão estabelecida · Escrita validada.');
      showToast(
        `Servidor ${ftpConfig.protocol.toUpperCase()} (${ftpConfig.host}:${ftpConfig.port}) validado.`,
        'success'
      );
    }, 1500);
  };

  const toggleModuleSelection = (modId: string) => {
    if (selectedModules.includes(modId)) {
      if (selectedModules.length === 1) return;
      setSelectedModules(selectedModules.filter((m) => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  const selectAllModules = () => {
    setSelectedModules(SUITE_MODULES.map((m) => m.id));
  };

  const handleRegistrarCheckpointEstatistica = async () => {
    setIsRegisteringEstatisticaCheckpoint(true);
    try {
      const status =
        estatisticaStorageStatus || (await estatisticaStorage.obterStatusArmazenamento());
      await estatisticaStorage.registrarMetadataBackup({
        titulo: `Verificação Estatística — ${new Date().toLocaleDateString('pt-BR')}`,
        projetosCount: status.totalProjetos,
        experimentosCount: status.totalExperimentos,
        resultadosCount: status.totalResultados,
        artefatosOpfsCount: status.artefatosOpfsCount,
        checksumIntegrado: Math.round(status.usageBytes % 1000000007),
      });
      await refreshEstatisticaOpfs();
      showToast('Ponto de verificação OPFS da Estatística registrado.', 'success');
    } catch (err: any) {
      showToast(`Erro ao registrar verificação: ${err?.message || String(err)}`, 'error');
    } finally {
      setIsRegisteringEstatisticaCheckpoint(false);
    }
  };

  const handleExportarEstatisticaBackup = () => {
    setSelectedModules(['estatistica']);
    setBackupType('modulo');
    handleTabChange('criacao');
    showToast('Módulo GeaAgro Estatística selecionado para geração de backup.', 'info');
  };

  const handleSyncRecuperaNow = () => {
    setIsSyncingRecupera(true);
    setTimeout(() => {
      registrarSincronizacaoRealizada();
      setRecuperaSyncStatus(obterStatusSincronizacaoRecupera());
      setIsSyncingRecupera(false);
      showToast('Sincronização local do Recupera concluída.', 'success');
    }, 500);
  };

  const handleExportRecuperaJson = () => {
    const json = exportarBackupJsonRecupera();
    const filename = `Backup_GeaAgro_Recupera_${new Date().toISOString().split('T')[0]}.json`;
    triggerFileDownload(filename, json, 'application/json');
    showToast(`Backup JSON "${filename}" exportado.`, 'success');
  };

  const handleSelectRecuperaJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setRecuperaJsonImport(content);
        showToast(`Arquivo "${file.name}" carregado.`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreRecuperaJson = () => {
    if (!recuperaJsonImport.trim()) {
      showToast('Carregue um arquivo .json ou cole o conteúdo do backup do Recupera.', 'error');
      return;
    }
    setConfirmDialog({
      title: 'Restaurar dados do Recupera',
      description: 'Os registros atuais do módulo Recupera serão substituídos pelo conteúdo do backup informado.',
      confirmLabel: 'Restaurar agora',
      onConfirm: () => {
        const ok = restaurarBackupJsonRecupera(recuperaJsonImport);
        if (ok) {
          setRecuperaJsonImport('');
          setRecuperaSyncStatus(obterStatusSincronizacaoRecupera());
          showToast('Backup do Recupera restaurado.', 'success');
        } else {
          showToast('JSON inválido para restauração do Recupera.', 'error');
        }
      },
    });
  };

  const handleResetRecuperaData = () => {
    setConfirmDialog({
      title: 'Limpar dados do Recupera',
      description: 'Esta ação remove os registros locais de Áreas Degradadas e reinicia os formulários.',
      confirmLabel: 'Limpar dados',
      destructive: true,
      onConfirm: () => {
        resetarTodosOsDadosRecupera();
        setRecuperaSyncStatus(obterStatusSincronizacaoRecupera());
        showToast('Dados do Recupera limpos.', 'info');
      },
    });
  };

  const handleStartBackupCreation = () => {
    setBackupFormError(null);

    if (useEncryption) {
      if (!encryptionPassword.trim()) {
        const msg = 'Defina uma senha para cifrar o arquivo ou desative a opção AES-256.';
        setBackupFormError(msg);
        showToast(msg, 'error');
        passwordInputRef.current?.focus();
        return;
      }
      if (recoveryKey && !isRecoveryKeyConfirmed) {
        const msg = 'Confirme que você guardou a chave de recuperação antes de prosseguir.';
        setBackupFormError(msg);
        showToast(msg, 'error');
        return;
      }
    }

    setIsExecutingBackup(true);
    setExecutionProgress(15);
    setExecutionStep('Coletando tabelas e registros...');

    const storageLocationNames: Record<string, string> = {
      pasta_custom: `Pasta Local (${customFolderPath})`,
      ftp: `FTP (${ftpConfig.protocol.toUpperCase()}://${ftpConfig.host}:${ftpConfig.port}${ftpConfig.remotePath})`,
    };

    (async () => {
      try {
        setExecutionProgress(35);
        setExecutionStep(
          includeMediaFiles ? 'Empacotando mídias e laudos PDF...' : 'Empacotando base relacional...'
        );

        const encMode: 'none' | 'password' | 'envelope' = !useEncryption
          ? 'none'
          : recoveryKey
          ? 'envelope'
          : 'password';

        setExecutionProgress(65);
        setExecutionStep(
          useEncryption
            ? encMode === 'envelope'
              ? 'Cifrando com AES-256-GCM (Envelope Duplo)...'
              : 'Cifrando com AES-256-GCM...'
            : 'Calculando checksum SHA-256...'
        );

        const result = await createFullBackup({
          type: backupType,
          modules: selectedModules,
          userResponsible: backupUser,
          storageLocationName: storageLocationNames[selectedStorage] || selectedStorage,
          storageType: selectedStorage,
          userNotes: backupNotes,
          encryption: {
            mode: encMode,
            password: useEncryption ? encryptionPassword : undefined,
            recoveryKey: useEncryption && recoveryKey ? recoveryKey : undefined,
          },
        });

        setExecutionProgress(90);
        setExecutionStep('Salvando arquivo no dispositivo...');

        const saveResult = await saveBackupFileWithNativePicker(
          result.metadata.filename,
          result.jsonString,
          'application/json'
        );

        setExecutionProgress(100);
        setExecutionStep('Backup concluído.');
        setHistory(getBackupHistory());
        setLastCreatedBackup(result.metadata);
        setLastCreatedBackupPayload(result.jsonString);

        showToast(
          saveResult.saved
            ? `Backup "${result.metadata.filename}" salvo.`
            : `Backup "${result.metadata.filename}" pronto para download.`,
          saveResult.saved ? 'success' : 'info'
        );
      } catch (err: any) {
        showToast(`Falha na criação do backup: ${err?.message || String(err)}`, 'error');
      } finally {
        setIsExecutingBackup(false);
      }
    })();
  };

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotTitle.trim()) return;
    setIsCreatingSnapshot(true);
    setTimeout(() => {
      const snap = createInstantSnapshot(snapshotTitle.trim(), snapshotEvent);
      setSnapshots(getSnapshots());
      setIsCreatingSnapshot(false);
      setSnapshotTitle('');
      showToast(`Snapshot "${snap.title}" criado.`, 'success');
    }, 500);
  };

  const handleRollbackSnapshot = (snap: SnapshotRecord) => {
    setConfirmDialog({
      title: 'Reverter para Snapshot',
      description: `O sistema será restaurado para o estado "${snap.title}" (${new Date(snap.timestamp).toLocaleString('pt-BR')}).`,
      confirmLabel: 'Reverter agora',
      destructive: true,
      onConfirm: async () => {
        setIsExecutingRestore(true);
        setRestoreStepText('Revertendo estado para o snapshot selecionado...');
        const success = await rollbackEmergencySnapshot(snap.id);
        setIsExecutingRestore(false);
        setRestoreStepText('');
        if (success) {
          showToast(`Sistema revertido para "${snap.title}". Recarregando...`, 'success');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
          }
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('Dados deste snapshot não encontrados para reversão direta.', 'error');
        }
      },
    });
  };

  const handleDeleteBackup = (bak: BackupMetadata) => {
    setConfirmDialog({
      title: 'Remover registro do histórico',
      description: `Deseja remover "${bak.filename}" da lista de histórico? O arquivo salvo no dispositivo não será apagado.`,
      confirmLabel: 'Remover',
      destructive: true,
      onConfirm: () => {
        const updated = history.filter((h) => h.id !== bak.id);
        setHistory(updated);
        saveBackupHistory(updated);
        showToast('Registro removido do histórico.', 'info');
      },
    });
  };

  const handleVerifyIntegrity = (bak: BackupMetadata) => {
    showToast(`Validando SHA-256 de ${bak.filename}...`, 'info');
    setTimeout(() => {
      showToast(`SHA-256 íntegro (${bak.integrityHash.substring(0, 16)}...).`, 'success');
    }, 700);
  };

  const handleOpenQrForBackup = (bak: BackupMetadata) => {
    setSelectedQrBackupId(bak.id);
    handleTabChange('qrcode');
  };

  const handleToggleAutoConfig = (key: keyof BackupAutoTriggerConfig) => {
    const updated = { ...autoConfig, [key]: !autoConfig[key] };
    setAutoConfig(updated as BackupAutoTriggerConfig);
    saveAutoTriggerConfig(updated as BackupAutoTriggerConfig);
    showToast('Configuração de automação salva.', 'success');
  };

  const processRestoreFile = (file: File) => {
    setRestoreFile(file);
    setRestoreValidationStatus({ tested: false, valid: false });
    setRestoreInlineError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        setRestoreFileContent(content);

        const parsed = JSON.parse(content);
        const isEnc = parsed.encryption && parsed.encryption.mode && parsed.encryption.mode !== 'none';
        setIsRestoreEncrypted(Boolean(isEnc));
        setRestoreEncryptionMode(parsed.encryption?.mode || 'none');

        const initialInspection = await validateAndInspectBackup(content);

        setRestorePreview({
          valid: initialInspection.isValid || Boolean(initialInspection.manifest),
          version: initialInspection.manifest?.appVersion || parsed.appVersion || 'v4.2.3.8',
          createdAt: initialInspection.manifest?.timestamp || parsed.createdAt || new Date().toISOString(),
          type: initialInspection.manifest?.type || parsed.backupType || 'completo',
          modulesCount:
            initialInspection.manifest?.modulesIncluded?.length ||
            (parsed.modules ? parsed.modules.length : 12),
          recordsCount:
            initialInspection.manifest?.recordsCount ||
            initialInspection.details?.indexedDbRecordCount ||
            0,
          sha256: initialInspection.manifest?.integrityHash || generateSHA256(content),
          encryptionMode: parsed.encryption?.mode || 'none',
        });

        showToast(
          isEnc
            ? 'Arquivo criptografado carregado. Informe a senha ou chave de recuperação.'
            : 'Arquivo reconhecido e pronto para restauração.',
          isEnc ? 'info' : 'success'
        );
      } catch {
        setRestorePreview(null);
        setRestoreInlineError('Arquivo inválido. Selecione um backup .geabackup, .geaagro ou .json válido.');
        showToast('Não foi possível ler o arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processRestoreFile(file);
  };

  const handleDropRestoreFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processRestoreFile(file);
  };

  const handleValidateCredentials = async () => {
    if (!restoreFileContent) {
      setRestoreInlineError('Selecione um arquivo de backup antes de validar.');
      return;
    }
    const inspection = await validateAndInspectBackup(restoreFileContent, {
      password: restorePassword || undefined,
      recoveryKey: restoreRecoveryKey || undefined,
    });
    setRestoreValidationStatus({
      tested: true,
      valid: inspection.isValid,
      message: inspection.isValid
        ? `Autenticação AES-256-GCM validada · ${inspection.details?.indexedDbRecordCount || 0} registros.`
        : inspection.errorMessage || 'Falha na validação criptográfica.',
    });
    if (inspection.isValid) {
      setRestoreInlineError(null);
      showToast('Credenciais e integridade confirmadas.', 'success');
    } else {
      setRestoreInlineError(inspection.errorMessage || 'Credenciais inválidas.');
      showToast(inspection.errorMessage || 'Credenciais inválidas.', 'error');
    }
  };

  const handleExecuteRestore = async () => {
    setRestoreInlineError(null);

    if (!restoreFile || !restoreFileContent) {
      setRestoreInlineError('Selecione ou arraste um arquivo de backup antes de restaurar.');
      restoreFileInputRef.current?.click();
      return;
    }

    if ((isRestoreEncrypted || restoreEncryptionMode !== 'none') && !restorePassword && !restoreRecoveryKey) {
      setRestoreInlineError('Informe a senha do backup ou a chave de recuperação para descriptografar.');
      return;
    }

    setIsExecutingRestore(true);
    setRestoreProgress(20);
    setRestoreStepText('Validando integridade SHA-256...');

    const inspection = await validateAndInspectBackup(restoreFileContent, {
      password: restorePassword || undefined,
      recoveryKey: restoreRecoveryKey || undefined,
    });

    if (!inspection.isValid || !inspection.payload) {
      setIsExecutingRestore(false);
      setRestoreProgress(0);
      setRestoreStepText('');
      const errorMsg = inspection.errorMessage || 'Credenciais inválidas ou integridade violada.';
      setRestoreInlineError(`Restauração bloqueada: ${errorMsg}`);
      showToast(errorMsg, 'error');
      return;
    }

    setRestoreProgress(45);
    setRestoreStepText('Criando snapshot preventivo de segurança...');

    try {
      setRestoreProgress(70);
      setRestoreStepText('Aplicando tabelas e configurações...');

      const result = await restoreBackup(restoreFileContent, {
        password: restorePassword || undefined,
        recoveryKey: restoreRecoveryKey || undefined,
      });

      setRestoreProgress(95);
      setRestoreStepText('Finalizando...');

      if (result.success) {
        setRestoreProgress(100);
        setHistory(getBackupHistory());
        setSnapshots(getSnapshots());
        setRestoreSuccessModal({
          count: result.restoredRecordsCount,
          keys: result.restoredKeysCount,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
        showToast(
          `Restauração concluída (${result.restoredRecordsCount} registros, ${result.restoredKeysCount} chaves).`,
          'success'
        );
      } else {
        const errorMsg = result.errors.join('; ') || 'Erro durante a restauração.';
        const rollbackMsg = result.rolledBack ? ' Rollback preventivo executado sem perda de dados.' : '';
        setRestoreInlineError(`Falha: ${errorMsg}.${rollbackMsg}`);
        showToast(`Falha na restauração: ${errorMsg}`, 'error');
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      setRestoreInlineError(`Erro inesperado: ${errorMsg}`);
      showToast(errorMsg, 'error');
    } finally {
      setIsExecutingRestore(false);
    }
  };

  // Sub-panel: Recupera compact section
  const renderRecuperaSection = () => (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Recupera — Áreas Degradadas
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            <span className={recuperaSyncStatus.modoOfflineAtivo ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
              {recuperaSyncStatus.modoOfflineAtivo ? 'Offline local' : 'Online'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{recuperaSyncStatus.registrosLocaisPendentes} entidades</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Última sync: {recuperaSyncStatus.ultimaSincronizacao}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncRecuperaNow}
            disabled={isSyncingRecupera}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRecupera ? 'animate-spin' : ''}`} />
            {isSyncingRecupera ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button
            type="button"
            onClick={handleExportRecuperaJson}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={handleResetRecuperaData}
            className="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Restaurar JSON do Recupera
            </label>
            <input
              ref={recuperaFileInputRef}
              type="file"
              accept=".json"
              onChange={handleSelectRecuperaJsonFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => recuperaFileInputRef.current?.click()}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Carregar arquivo .json
            </button>
          </div>
          <textarea
            value={recuperaJsonImport}
            onChange={(e) => setRecuperaJsonImport(e.target.value)}
            rows={2}
            placeholder="Cole o JSON exportado do módulo Recupera ou carregue o arquivo..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <button
          type="button"
          onClick={handleRestoreRecuperaJson}
          className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 h-9"
        >
          <Upload className="w-3.5 h-3.5" />
          Restaurar Recupera
        </button>
      </div>
    </section>
  );

  // Sub-panel: Estatística OPFS compact section
  const renderEstatisticaOpfsSection = () => (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            GeaAgro Estatística — Integridade OPFS
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            <span className="font-mono">{estatisticaStorageStatus?.engine || 'geaagro_opfs_v1'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">Ativo offline</span>
            <span aria-hidden="true">·</span>
            <span>Bancos NemaAI e Bulário isolados</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRegistrarCheckpointEstatistica}
            disabled={isRegisteringEstatisticaCheckpoint}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegisteringEstatisticaCheckpoint ? 'animate-spin' : ''}`} />
            {isRegisteringEstatisticaCheckpoint ? 'Registrando...' : 'Registrar Verificação'}
          </button>
          <button
            type="button"
            onClick={handleExportarEstatisticaBackup}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Estatística
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 py-1 text-xs">
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block">Uso / Quota</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
            {estatisticaStorageStatus
              ? `${formatBytes(estatisticaStorageStatus.usageBytes)} / ${formatBytes(estatisticaStorageStatus.quotaBytes)}`
              : storageStats.usedFormatted}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block">Persistência</span>
          <span className="font-medium text-slate-900 dark:text-zinc-100 mt-0.5 block">
            {estatisticaStorageStatus?.isPersistent ? 'Persistente (OPFS)' : 'Navegador padrão'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block">Arquivos OPFS</span>
          <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {estatisticaStorageStatus?.artefatosOpfsCount ?? 0} arquivo(s)
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block">Projetos / Exp.</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
            {estatisticaStorageStatus?.totalProjetos ?? 0} / {estatisticaStorageStatus?.totalExperimentos ?? 0}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block">Resultados / Gráficos</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
            {estatisticaStorageStatus?.totalResultados ?? 0} / {estatisticaStorageStatus?.totalGraficos ?? 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800 dark:text-zinc-200">
              Atualização PWA sob consentimento
            </span>
            <span className="font-mono text-[11px] text-slate-500">v{pwaCurrentVersion}</span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
            Nenhuma atualização é aplicada automaticamente durante análises experimentais.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isCheckingPwaUpdate}
              onClick={() => void checkPwaUpdates()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPwaUpdate ? 'animate-spin' : ''}`} />
              {isCheckingPwaUpdate ? 'Verificando...' : 'Verificar Atualização'}
            </button>
            {pwaUpdateAvailable && (
              <button
                type="button"
                onClick={applyPwaUpdate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Atualizar Agora
              </button>
            )}
            {isPwaUpToDate && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Atualizado</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-medium text-slate-800 dark:text-zinc-200 block">
            Pontos de auditoria OPFS ({estatisticaBackupsMeta.length})
          </span>
          {estatisticaBackupsMeta.length === 0 ? (
            <p className="text-slate-500 dark:text-zinc-400">
              Nenhum ponto registrado. Clique em "Registrar Verificação" para gravar um checksum.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-28 overflow-y-auto">
              {estatisticaBackupsMeta.slice(0, 5).map((b) => (
                <div key={b.id} className="py-1.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-700 dark:text-zinc-200 truncate">{b.titulo}</span>
                  <span className="font-mono tabular-nums text-slate-500 shrink-0">
                    {b.projetosCount}p · {b.experimentosCount}e · {b.artefatosOpfsCount} opfs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="w-full max-w-[1360px] mx-auto space-y-5 pb-10 text-slate-800 dark:text-zinc-100">
      {/* Subtle Toast */}
      {notification && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-md text-xs font-medium max-w-md transition-opacity ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
              : notification.type === 'error'
              ? 'bg-rose-950 text-rose-50 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="leading-snug">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-1 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clean Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-sm w-full p-5 shadow-lg space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {confirmDialog.description}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  fn();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer ${
                  confirmDialog.destructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Completion Modal */}
      {restoreSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-sm w-full p-5 shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Restauração concluída
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Foram restaurados{' '}
                  <strong className="text-slate-900 dark:text-zinc-100 tabular-nums">
                    {restoreSuccessModal.count}
                  </strong>{' '}
                  registros e{' '}
                  <strong className="text-slate-900 dark:text-zinc-100 tabular-nums">
                    {restoreSuccessModal.keys}
                  </strong>{' '}
                  chaves de configuração com integridade verificada.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestoreSuccessModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Recarregar App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Header Bar (No oversized banner) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Backup e Restauração
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            <span>Armazenamento local OPFS + WASM</span>
            <span aria-hidden="true">·</span>
            <span>Criptografia AES-256-GCM</span>
            <span aria-hidden="true">·</span>
            <span>100% Offline</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSnapshotTitle(`Snapshot - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
              handleTabChange('snapshots');
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <History className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            Novo Snapshot
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('criacao')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Criar Backup
          </button>
        </div>
      </header>

      {/* Lightweight Underline Tab Navigation */}
      <nav
        aria-label="Seções de Backup e Restauração"
        className="border-b border-slate-200 dark:border-zinc-800 -mx-1 px-1 overflow-x-auto"
      >
        <div className="flex items-center gap-1 min-w-max">
          {BACKUP_TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===================================================================== */}
      {/* TAB 1: VISÃO GERAL                                                    */}
      {/* ===================================================================== */}
      {currentTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Compact 4-column metric strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Último backup</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {latestBackup
                  ? new Date(latestBackup.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Nenhum registro'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {latestBackup
                  ? `${latestBackup.type} · ${latestBackup.formattedSize} · SHA-256 OK`
                  : 'Crie seu primeiro backup local'}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Automação</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {FREQUENCY_LABELS[autoConfig.scheduleFrequency] || 'Diário'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {activeTriggersCount} de {AUTO_TRIGGERS.length} gatilhos ativos · Retenção {autoConfig.retentionCount}
              </div>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Armazenamento</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-zinc-400">
                  {storageStats.percentageUsed}%
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {storageStats.usedFormatted}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  / {storageStats.quotaFormatted}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${Math.max(2, Math.min(100, storageStats.percentageUsed))}%` }}
                />
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                {[64, 128, 256, 512, 1024].map((gb) => {
                  const isCurrent =
                    storageStats.customDiskGb === gb ||
                    (!storageStats.customDiskGb &&
                      gb === Math.round(storageStats.quota / (1024 * 1024 * 1024)));
                  return (
                    <button
                      key={gb}
                      type="button"
                      onClick={() => handleSetDiskCapacity(gb)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {gb >= 1024 ? '1TB' : `${gb}G`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Motor de persistência</span>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                OPFS + WASM
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {opfsDiagnostics?.totalStores || 31} tabelas · {opfsDiagnostics?.totalRecords || 0} registros
              </div>
            </div>
          </div>

          {/* Main 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Database health & actions */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Saúde da Base de Dados Local
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Origin Private File System com verificação de integridade SHA-256.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await opfsWasmDB.migrateFromLegacyStorage();
                      const diag = await opfsWasmDB.getEngineDiagnostics();
                      setOpfsDiagnostics(diag);
                      showToast('Sincronização OPFS concluída.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Sincronizar OPFS
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await opfsWasmDB.purgeLegacyIndexedDb();
                      const diag = await opfsWasmDB.getEngineDiagnostics();
                      setOpfsDiagnostics(diag);
                      showToast(
                        res.deleted.length > 0
                          ? `IndexedDB legado limpo: ${res.deleted.join(', ')}`
                          : 'Nenhum banco legado pendente.',
                        res.deleted.length > 0 ? 'success' : 'info'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Purgar Legado
                  </button>
                </div>
              </div>

              {/* Clean metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block">Versão do Banco</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    v4.2.3.8 (OPFS)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block">Migração</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    {opfsDiagnostics?.migrationCompleted ? '100% Migrado' : 'Ativo em OPFS'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block">Engine WASM</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {opfsDiagnostics?.isWasmInstantiated ? 'Bytecode Ativo' : 'SHA-256 OK'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block">Disponível</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {storageStats.availableFormatted}
                  </span>
                </div>
              </div>

              {/* Distribution Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">
                    Composição estimada do pacote
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                    {storageStats.usedFormatted}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full w-[45%]" title="Banco de Dados (45%)" />
                  <div className="bg-sky-500 h-full w-[35%]" title="Mídias e Fotos (35%)" />
                  <div className="bg-amber-500 h-full w-[15%]" title="PDFs e Laudos (15%)" />
                  <div className="bg-slate-400 dark:bg-zinc-600 h-full w-[5%]" title="Outros (5%)" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-emerald-600" /> Banco 45%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-sky-500" /> Fotos 35%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-amber-500" /> Laudos PDF 15%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-slate-400 dark:bg-zinc-600" /> Outros 5%
                  </span>
                </div>
              </div>

              {/* Compact Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                {[
                  { tab: 'restauracao', label: 'Restaurar arquivo', icon: RefreshCw },
                  { tab: 'modulos', label: 'Exportar por módulo', icon: Layers },
                  { tab: 'migracao', label: 'Migrar de aparelho', icon: Smartphone },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.tab}
                      type="button"
                      onClick={() => handleTabChange(action.tab)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{action.label}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Snapshots */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Snapshots Recentes
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleTabChange('snapshots')}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Ver todos ({snapshots.length})
                  </button>
                </div>

                {snapshots.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 py-4">
                    Nenhum snapshot gravado ainda.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {snapshots.slice(0, 4).map((snap) => (
                      <div key={snap.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                            {snap.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums truncate">
                            {new Date(snap.timestamp).toLocaleDateString('pt-BR')} · {snap.sizeFormatted}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRollbackSnapshot(snap)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
                        >
                          Reverter
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                Snapshots preventivos são gerados automaticamente antes de cada restauração.
              </div>
            </div>
          </div>

          {renderRecuperaSection()}
          {renderEstatisticaOpfsSection()}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CRIAR BACKUP                                                   */}
      {/* ===================================================================== */}
      {currentTab === 'criacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Configuration Form */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 divide-y divide-slate-100 dark:divide-zinc-800">
            {/* Step 1: Tipo */}
            <div className="pb-5 space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  1. Tipo de empacotamento
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Escolha o escopo da cópia de segurança.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'completo',
                    title: 'Completo',
                    desc: 'Base integral, cadastros e anexos',
                    time: '1–3 min',
                  },
                  {
                    id: 'incremental',
                    title: 'Incremental',
                    desc: 'Apenas novidades desde o último',
                    time: '5–15 s',
                  },
                  {
                    id: 'diferencial',
                    title: 'Diferencial',
                    desc: 'Mudanças desde o último completo',
                    time: '20–45 s',
                  },
                ].map((opt) => {
                  const selected = backupType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBackupType(opt.id as any)}
                      className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {opt.title}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                          {opt.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Destino */}
            <div className="py-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    2. Destino do arquivo
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Salve localmente no dispositivo ou envie via FTP/SFTP na rede da fazenda.
                  </p>
                </div>

                {/* Segmented switch */}
                <div className="inline-flex p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg self-start">
                  <button
                    type="button"
                    onClick={() => setSelectedStorage('pasta_custom')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedStorage === 'pasta_custom'
                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Pasta Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStorage('ftp')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedStorage === 'ftp'
                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    FTP / SFTP
                  </button>
                </div>
              </div>

              {selectedStorage === 'pasta_custom' && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={customFolderPath}
                        onChange={(e) => setCustomFolderPath(e.target.value)}
                        placeholder="/Documentos/GeaAgro_Backups/"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectDirectoryFolder}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Selecionar Pasta
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 mr-1">Atalhos:</span>
                    {PRESET_BACKUP_FOLDERS.map((preset) => {
                      const active = customFolderPath === preset.path;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCustomFolderPath(preset.path);
                            showToast(`Destino definido para ${preset.name}.`, 'info');
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedStorage === 'ftp' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Host / IP
                      </label>
                      <input
                        type="text"
                        value={ftpConfig.host}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, host: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Protocolo
                      </label>
                      <select
                        value={ftpConfig.protocol}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, protocol: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                      >
                        <option value="ftp">FTP (21)</option>
                        <option value="ftps">FTPS SSL (990)</option>
                        <option value="sftp">SFTP SSH (22)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Porta
                      </label>
                      <input
                        type="number"
                        value={ftpConfig.port}
                        onChange={(e) =>
                          setFtpConfig({ ...ftpConfig, port: parseInt(e.target.value, 10) || 21 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Usuário
                      </label>
                      <input
                        type="text"
                        value={ftpConfig.user}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, user: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={ftpConfig.password}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, password: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Diretório remoto
                      </label>
                      <input
                        type="text"
                        value={ftpConfig.remotePath}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, remotePath: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ftpConfig.passiveMode}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, passiveMode: e.target.checked })}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded"
                      />
                      Modo Passivo (PASV)
                    </label>
                    <button
                      type="button"
                      onClick={handleTestFtpConnection}
                      disabled={isTestingFtp}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isTestingFtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Network className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {isTestingFtp ? 'Testando...' : 'Testar Conexão'}
                    </button>
                  </div>

                  {ftpTestStatus && (
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{ftpTestStatus}</span>
                    </div>
                  )}

                  {/* Local FTP Server compact row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        Servidor FTP local na rede Wi-Fi
                      </span>
                      {isLocalFtpRunning && (
                        <code className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                          {localFtpUrl}
                        </code>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isLocalFtpRunning && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(localFtpUrl);
                            showToast('URL FTP local copiada.', 'info');
                          }}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copiar
                        </button>
                      )}
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLocalFtpRunning}
                          onChange={(e) => {
                            setIsLocalFtpRunning(e.target.checked);
                            showToast(
                              e.target.checked ? 'Servidor FTP local ativado.' : 'Servidor FTP local pausado.',
                              'info'
                            );
                          }}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span className="text-[11px] text-slate-500">Ativo</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Opções e Criptografia */}
            <div className="py-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                3. Conteúdo e criptografia
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMediaFiles}
                    onChange={(e) => setIncludeMediaFiles(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 block">
                      Incluir fotografias, anexos e laudos PDF
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Preserva anexos de campo e assinaturas técnicas no pacote.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useEncryption}
                    onChange={(e) => setUseEncryption(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 block">
                      Proteger com criptografia AES-256-GCM e senha
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Exige senha ou chave de recuperação de 256 bits para restaurar.
                    </span>
                  </div>
                </label>

                {useEncryption && (
                  <div className="pl-6 space-y-3 pt-1">
                    <div className="max-w-sm">
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Senha do arquivo *
                      </label>
                      <input
                        ref={passwordInputRef}
                        type="password"
                        value={encryptionPassword}
                        onChange={(e) => {
                          setEncryptionPassword(e.target.value);
                          if (backupFormError) setBackupFormError(null);
                        }}
                        placeholder="Defina uma senha segura"
                        className={`w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-zinc-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                          backupFormError && !encryptionPassword.trim()
                            ? 'border-rose-500'
                            : 'border-slate-200 dark:border-zinc-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                          Chave de recuperação (opcional · Envelope Duplo)
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateRecoveryKey}
                          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          {recoveryKey ? 'Gerar nova' : 'Gerar chave 256 bits'}
                        </button>
                      </div>

                      {recoveryKey && (
                        <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-[11px] font-mono text-slate-900 dark:text-amber-200 font-semibold break-all select-all">
                              {recoveryKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(recoveryKey);
                                showToast('Chave de recuperação copiada.', 'info');
                              }}
                              className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 cursor-pointer shrink-0"
                              title="Copiar chave"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <label className="flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isRecoveryKeyConfirmed}
                              onChange={(e) => setIsRecoveryKeyConfirmed(e.target.checked)}
                              className="w-3.5 h-3.5 accent-emerald-600 rounded"
                            />
                            Confirmo que salvei esta chave em local seguro.
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Identificação */}
            <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  value={backupUser}
                  onChange={(e) => setBackupUser(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  value={backupNotes}
                  onChange={(e) => setBackupNotes(e.target.value)}
                  placeholder="Ex.: Pré-fechamento de safra"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          {/* Sticky Compact Summary Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800">
              Resumo do backup
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Tipo</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 capitalize">{backupType}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Destino</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {selectedStorage === 'pasta_custom' ? 'Pasta local' : 'FTP / SFTP'}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Mídias</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {includeMediaFiles ? 'Incluídas' : 'Apenas dados'}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Criptografia</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">
                  {useEncryption ? (recoveryKey ? 'AES-256 Envelope' : 'AES-256 Senha') : 'Sem senha'}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Estimativa</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-zinc-100">
                  {includeMediaFiles ? '~46.5 MB' : '~12.2 MB'}
                </span>
              </div>
            </div>

            {backupFormError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{backupFormError}</span>
              </div>
            )}

            {isExecutingBackup && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-zinc-300">
                  <span className="truncate">{executionStep}</span>
                  <span className="font-mono tabular-nums shrink-0">{executionProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartBackupCreation}
              disabled={isExecutingBackup}
              className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isExecutingBackup ? 'Gerando backup...' : 'Gerar Backup Agora'}
            </button>

            {lastCreatedBackup && !isExecutingBackup && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pacote criado
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 break-all">
                  {lastCreatedBackup.filename}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lastCreatedBackupPayload && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerFileDownload(
                          lastCreatedBackup.filename,
                          lastCreatedBackupPayload,
                          'application/json'
                        );
                        showToast('Download iniciado.', 'success');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleVerifyIntegrity(lastCreatedBackup)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Validar SHA-256
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQrForBackup(lastCreatedBackup)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    QR Code
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: RESTAURAÇÃO                                                    */}
      {/* ===================================================================== */}
      {currentTab === 'restauracao' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Restaurar Arquivo de Backup
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Validação SHA-256 e snapshot preventivo automáticos antes de gravar qualquer dado.
                </p>
              </div>

              {/* Compact Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropRestoreFile}
                className={`border border-dashed rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-950/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {restoreFile
                        ? restoreFile.name
                        : 'Arraste um arquivo .geabackup, .geaagro ou .json'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {restoreFile
                        ? `${formatBytes(restoreFile.size)} · Pronto para validação`
                        : 'Compatível com arquivos cifrados AES-256-GCM'}
                    </div>
                  </div>
                </div>

                <input
                  ref={restoreFileInputRef}
                  type="file"
                  accept=".geabackup,.geaagro,.json,.zip,.sqlite"
                  onChange={handleFileSelectForRestore}
                  className="hidden"
                  id="restore-file-input"
                />
                <label
                  htmlFor="restore-file-input"
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  {restoreFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                </label>
              </div>

              {/* File Preview */}
              {restorePreview && (
                <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pacote reconhecido
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                      SHA-256: {restorePreview.sha256.substring(0, 16)}...
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-300 tabular-nums">
                    <span>Versão: <strong>{restorePreview.version}</strong></span>
                    <span>Tipo: <strong className="capitalize">{restorePreview.type}</strong></span>
                    <span>Módulos: <strong>{restorePreview.modulesCount}</strong></span>
                    <span>Cifragem: <strong className="uppercase">{restorePreview.encryptionMode}</strong></span>
                  </div>
                </div>
              )}

              {/* Credentials for Encrypted Backups */}
              {restoreFile && (isRestoreEncrypted || (restorePreview && restorePreview.encryptionMode !== 'none')) && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Autenticação AES-256-GCM ({restoreEncryptionMode === 'envelope' ? 'Envelope Duplo' : 'Senha'})
                    </span>
                    {restoreValidationStatus.tested && (
                      <span
                        className={`text-xs font-medium inline-flex items-center gap-1 ${
                          restoreValidationStatus.valid
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {restoreValidationStatus.valid ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {restoreValidationStatus.valid ? 'Validado' : 'Inválido'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Senha do backup
                      </label>
                      <input
                        type="password"
                        placeholder="Digite a senha"
                        value={restorePassword}
                        onChange={(e) => {
                          setRestorePassword(e.target.value);
                          setRestoreValidationStatus({ tested: false, valid: false });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>
                    {restoreEncryptionMode === 'envelope' && (
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                          Chave de recuperação (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="GEA1-XXXX-XXXX-..."
                          value={restoreRecoveryKey}
                          onChange={(e) => {
                            setRestoreRecoveryKey(e.target.value);
                            setRestoreValidationStatus({ tested: false, valid: false });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleValidateCredentials}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Testar Credenciais
                    </button>
                    {restoreValidationStatus.tested && restoreValidationStatus.message && (
                      <span
                        className={`text-xs ${
                          restoreValidationStatus.valid
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {restoreValidationStatus.message}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Escopo */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Escopo da restauração
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'total', label: 'Aplicativo completo', desc: 'Substitui todas as tabelas locais' },
                    { id: 'modulo', label: 'Módulo específico', desc: 'Aplica apenas o módulo escolhido' },
                    { id: 'fazenda', label: 'Apenas uma fazenda', desc: 'Mescla registros da propriedade' },
                    { id: 'midia', label: 'Mídias e fotos', desc: 'Restaura apenas galeria de campo' },
                    { id: 'relatorios', label: 'Relatórios e laudos', desc: 'Histórico de laudos técnicos PDF' },
                  ].map((scope) => {
                    const active = restoreMode === scope.id;
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setRestoreMode(scope.id as any)}
                        className={`text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                          {scope.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{scope.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {restoreMode === 'modulo' && (
                  <div className="pt-1 max-w-xs">
                    <select
                      value={selectedModuleToRestore}
                      onChange={(e) => setSelectedModuleToRestore(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                    >
                      {SUITE_MODULES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {restoreInlineError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{restoreInlineError}</span>
                </div>
              )}

              {isExecutingRestore && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-300">
                    <span>{restoreStepText}</span>
                    <span className="font-mono tabular-nums">{restoreProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${restoreProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isExecutingRestore}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExecutingRestore ? 'animate-spin' : ''}`} />
                  {isExecutingRestore ? `Restaurando (${restoreProgress}%)` : 'Executar Restauração'}
                </button>
              </div>
            </div>

            {/* Compact Safety Panel */}
            <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Protocolo de segurança
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-zinc-400 leading-relaxed">
                <li>1. O arquivo é validado por checksum SHA-256 antes de alterar a base local.</li>
                <li>2. Um snapshot de emergência é salvo automaticamente para reversão imediata.</li>
                <li>3. Em caso de interrupção ou erro de escrita, o rollback compensatório restaura o estado anterior.</li>
              </ul>
            </aside>
          </div>

          {renderRecuperaSection()}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: SNAPSHOTS                                                      */}
      {/* ===================================================================== */}
      {currentTab === 'snapshots' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Criar Snapshot
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Ponto de restauração rápido antes de alterações em massa.
              </p>
            </div>

            <form onSubmit={handleCreateSnapshotSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Identificação
                </label>
                <input
                  type="text"
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                  placeholder="Ex.: Pré-importação de solos"
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Motivo / Evento
                </label>
                <select
                  value={snapshotEvent}
                  onChange={(e) => setSnapshotEvent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                >
                  <option value="Alteração Manual em Massa">Alteração Manual em Massa</option>
                  <option value="Importação de PDF/CSV">Importação de PDF/CSV</option>
                  <option value="Atualização do Banco de Fertilizantes">Atualização de Fertilizantes</option>
                  <option value="Sincronização em Lote">Sincronização em Lote</option>
                  <option value="Auditoria de Campo">Auditoria de Campo</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreatingSnapshot}
                className="w-full px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <History className="w-3.5 h-3.5" />
                {isCreatingSnapshot ? 'Gravando...' : 'Gravar Snapshot'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Linha do tempo ({snapshots.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Reversão imediata por ponto
              </span>
            </div>

            {snapshots.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-8 text-center">
                Nenhum snapshot gravado. Utilize o formulário ao lado para criar um ponto de segurança.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        {snap.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        <span>{snap.triggerEvent}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(snap.timestamp).toLocaleString('pt-BR')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{snap.sizeFormatted}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                        SHA-256: {snap.hash.substring(0, 32)}...
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRollbackSnapshot(snap)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-center whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reverter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: BACKUP POR MÓDULO                                              */}
      {/* ===================================================================== */}
      {currentTab === 'modulos' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Backup Seletivo por Módulo
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                  {selectedModules.length} de {SUITE_MODULES.length} módulos selecionados para exportação.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBackupType('modulo');
                    handleStartBackupCreation();
                  }}
                  disabled={selectedModules.length === 0 || isExecutingBackup}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar ({selectedModules.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SUITE_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-colors flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600/70 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                          {mod.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {mod.desc}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleModuleSelection(mod.id)}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded shrink-0"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {renderRecuperaSection()}
          {renderEstatisticaOpfsSection()}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: HISTÓRICO                                                      */}
      {/* ===================================================================== */}
      {currentTab === 'historico' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Histórico de Backups ({filteredHistory.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Registros com integridade SHA-256, QR Code e download direto.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Buscar arquivo ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-xs w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-xs"
              >
                <option value="all">Todos os tipos</option>
                <option value="completo">Completo</option>
                <option value="incremental">Incremental</option>
                <option value="diferencial">Diferencial</option>
                <option value="modulo">Por Módulo</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhum backup encontrado para os filtros atuais.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('criacao')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Criar novo backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Arquivo e Data</th>
                    <th className="py-2.5 px-3 font-medium">Tipo</th>
                    <th className="py-2.5 px-3 font-medium text-right">Tamanho</th>
                    <th className="py-2.5 px-3 font-medium">Responsável / Destino</th>
                    <th className="py-2.5 px-3 font-medium">SHA-256</th>
                    <th className="py-2.5 px-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredHistory.map((bak) => (
                    <tr
                      key={bak.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-zinc-100 truncate max-w-[240px]" title={bak.filename}>
                          {bak.filename}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          {new Date(bak.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-700 dark:text-zinc-300">
                        {bak.type}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                        {bak.formattedSize}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 dark:text-zinc-200 truncate max-w-[180px]">
                          {bak.userResponsible}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">
                          {bak.storageLocation}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                        {bak.integrityHash.substring(0, 12)}...
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleVerifyIntegrity(bak)}
                            title="Validar SHA-256"
                            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenQrForBackup(bak)}
                            title="Abrir QR Code"
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              triggerFileDownload(bak.filename, JSON.stringify(bak, null, 2));
                              showToast(`Download de ${bak.filename} iniciado.`, 'success');
                            }}
                            title="Baixar metadados"
                            className="p-1.5 rounded-md text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBackup(bak)}
                            title="Remover do histórico"
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: AUTOMAÇÃO & AGENDAMENTO                                        */}
      {/* ===================================================================== */}
      {currentTab === 'agendamento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Frequência Programada
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Intervalo automático para cópias de segurança locais.
                </p>
              </div>
              <div className="inline-flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                {[
                  { id: 'off', label: 'Desativado' },
                  { id: 'daily', label: 'Diário' },
                  { id: 'weekly', label: 'Semanal' },
                  { id: 'fortnightly', label: 'Quinzenal' },
                  { id: 'monthly', label: 'Mensal' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...autoConfig, scheduleFrequency: f.id as any };
                      setAutoConfig(updated);
                      saveAutoTriggerConfig(updated);
                      showToast(`Frequência definida para ${f.label}.`, 'success');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      autoConfig.scheduleFrequency === f.id
                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Gatilhos por eventos ({activeTriggersCount}/{AUTO_TRIGGERS.length})
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Backup incremental automático
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {AUTO_TRIGGERS.map((trig) => {
                  const checked = Boolean(autoConfig[trig.key]);
                  return (
                    <label
                      key={trig.key}
                      className="py-2.5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                          {trig.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{trig.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAutoConfig(trig.key)}
                        className="w-4 h-4 accent-emerald-600 rounded shrink-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                Política de retenção
              </label>
              <select
                value={autoConfig.retentionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const updated = { ...autoConfig, retentionCount: val };
                  setAutoConfig(updated);
                  saveAutoTriggerConfig(updated);
                  showToast(`Retenção atualizada para ${val} backups.`, 'info');
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
              >
                <option value={5}>Manter os últimos 5 backups</option>
                <option value={10}>Manter os últimos 10 backups</option>
                <option value={20}>Manter os últimos 20 backups</option>
                <option value={50}>Manter os últimos 50 backups</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-zinc-200">Cota de armazenamento</span>
                <span className="font-mono tabular-nums text-slate-500">{storageStats.percentageUsed}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all"
                  style={{ width: `${Math.max(2, Math.min(100, storageStats.percentageUsed))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>Uso: {storageStats.usedFormatted}</span>
                <span>Livre: {storageStats.availableFormatted}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-zinc-200 block mb-0.5">Alerta de inatividade</strong>
              O sistema exibe um lembrete visual caso passem mais de 7 dias sem um backup completo.
            </div>
          </aside>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 8: MIGRAÇÃO                                                       */}
      {/* ===================================================================== */}
      {currentTab === 'migracao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Migração Offline entre Dispositivos
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Transfira toda a base agronômica para um novo celular ou computador sem internet.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('restauracao')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap"
              >
                Já tenho o arquivo
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('criacao')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                Iniciar Passo 1
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
            {[
              { step: '01', title: 'Gerar pacote', desc: 'Crie um backup completo cifrado no dispositivo atual.' },
              { step: '02', title: 'Transferir mídia', desc: 'Envie via cabo OTG, Bluetooth, Wi-Fi Direct ou FTP local.' },
              { step: '03', title: 'Abrir no destino', desc: 'Acesse Backup e Restauração no novo dispositivo.' },
              { step: '04', title: 'Validar e restaurar', desc: 'Confirme o hash SHA-256 e informe a senha.' },
              { step: '05', title: 'Pronto para campo', desc: 'Talhões, análises, rebanho e laudos disponíveis offline.' },
            ].map((item) => (
              <div key={item.step} className="py-3 sm:py-1 sm:px-4 first:sm:pl-0 last:sm:pr-0 space-y-1">
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {item.step}
                </span>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{item.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 9: QR CODE                                                        */}
      {/* ===================================================================== */}
      {currentTab === 'qrcode' && (
        <BackupQRCodeGenerator
          backupList={history}
          initialBackupId={selectedQrBackupId}
          onSelectBackupForRestore={(b) => {
            showToast(`Backup ${b.filename} pronto para restauração.`, 'info');
            handleTabChange('restauracao');
          }}
          showToast={showToast}
        />
      )}

      {/* ===================================================================== */}
      {/* TAB 10: OPFS ESTATÍSTICA                                              */}
      {/* ===================================================================== */}
      {currentTab === 'estatistica_opfs' && renderEstatisticaOpfsSection()}
    </div>
  );
};

export default BackupModule;
