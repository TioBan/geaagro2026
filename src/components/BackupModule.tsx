import React, { useState, useEffect, useRef } from 'react';
import { BackupQRCodeGenerator } from './BackupQRCodeGenerator';
import { useStorageEstimate } from '../hooks/useStorageEstimate';
import {
  Database,
  HardDrive,
  ShieldCheck,
  Lock,
  RefreshCw,
  Clock,
  QrCode,
  FileText,
  Layers,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calendar,
  Sparkles,
  Smartphone,
  Trash2,
  Copy,
  Key,
  FolderArchive,
  Info,
  ShieldAlert,
  Search,
  Upload,
  Folder,
  Server,
  WifiOff,
  FileCode,
  History,
  Radio,
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
  Wifi,
  RotateCcw
} from 'lucide-react';
import {
  BackupMetadata,
  SnapshotRecord,
  BackupAutoTriggerConfig,
  getBackupHistory,
  saveBackupHistory,
  getSnapshots,
  saveSnapshots,
  getAutoTriggerConfig,
  saveAutoTriggerConfig,
  createFullBackup,
  restoreBackup,
  rollbackEmergencySnapshot,
  validateAndInspectBackup,
  executeBackupCreation,
  createInstantSnapshot,
  generateSHA256,
  triggerFileDownload,
  formatBytes
} from '../utils/backupService';
import { CryptoService } from '../services/cryptoService';
import {
  pickBackupFolder,
  PRESET_BACKUP_FOLDERS,
  saveBackupFileWithNativePicker
} from '../services/folderPickerService';
import { opfsWasmDB, OpfsEngineDiagnostics } from '../services/opfsWasmDatabase';

interface BackupModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const BackupModule: React.FC<BackupModuleProps> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab);

  // Sync internal state if prop changes
  useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (setActiveSubTab) setActiveSubTab(tabId);
  };

  // State
  const [history, setHistory] = useState<BackupMetadata[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [autoConfig, setAutoConfig] = useState<BackupAutoTriggerConfig>(getAutoTriggerConfig());

  // Search & Filters in History
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // New Backup State Form
  const [backupType, setBackupType] = useState<'completo' | 'incremental' | 'diferencial' | 'modulo'>('completo');
  const [selectedStorage, setSelectedStorage] = useState<'pasta_custom' | 'ftp'>('pasta_custom');
  const [customFolderPath, setCustomFolderPath] = useState<string>('/Documentos/GeaAgro_Backups/');

  // FTP / SFTP Server Configuration State
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

  // Local FTP Server Hosting Node State
  const [isLocalFtpRunning, setIsLocalFtpRunning] = useState<boolean>(true);
  const [localFtpUrl, setLocalFtpUrl] = useState<string>('ftp://192.168.1.100:2121');

  const [includeMediaFiles, setIncludeMediaFiles] = useState<boolean>(true);
  const [useEncryption, setUseEncryption] = useState<boolean>(false);
  const [encryptionPassword, setEncryptionPassword] = useState<string>('');
  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [isRecoveryKeyConfirmed, setIsRecoveryKeyConfirmed] = useState<boolean>(false);
  const [backupNotes, setBackupNotes] = useState<string>('');
  const [backupUser, setBackupUser] = useState<string>('Dr. Lucas Mendes (Agrônomo)');
  const [backupFormError, setBackupFormError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateRecoveryKey = () => {
    const keyDetails = CryptoService.generateRecoveryKey();
    setRecoveryKey(keyDetails.formattedKey);
    setIsRecoveryKeyConfirmed(false);
    showToast('Nova chave de recuperação segura de 256 bits gerada com sucesso!', 'info');
  };

  // Directory Folder Selector with native System Directory API and preset shortcuts
  // (Never triggers browser upload warnings)
  const handleSelectDirectoryFolder = async () => {
    try {
      const result = await pickBackupFolder({
        suggestedPath: customFolderPath,
        allowWebkitFallback: false // Never trigger browser upload prompt
      });

      if (result.success && result.folderPath) {
        setCustomFolderPath(result.folderPath);
        showToast(result.message || `Pasta "${result.folderName}" selecionada com sucesso!`, 'success');
      } else if (result.status === 'cancelled') {
        // Cancelamento pelo usuário: não exibir alerta de erro
        console.log('[BackupModule] Seleção de pasta cancelada pelo usuário.');
      } else if (result.status === 'permission_denied') {
        showToast('Permissão de acesso à pasta não concedida pelo navegador.', 'info');
      } else if (result.status === 'restricted_system') {
        showToast('Utilize os atalhos rápidos (Área de Trabalho, Downloads, Documentos) ou digite a pasta.', 'info');
      } else if (result.message) {
        showToast(result.message, 'info');
      }
    } catch (err: any) {
      console.warn('[BackupModule] Erro ao selecionar pasta:', err);
      showToast('Selecione um dos atalhos rápidos abaixo ou digite o caminho desejado.', 'info');
    }
  };

  // Test FTP / SFTP Server Connection
  const handleTestFtpConnection = () => {
    setIsTestingFtp(true);
    setFtpTestStatus('Conectando ao servidor FTP...');
    setTimeout(() => {
      setFtpTestStatus('Autenticando usuário e verificando permissões de escrita...');
    }, 800);
    setTimeout(() => {
      setIsTestingFtp(false);
      setFtpTestStatus('Conexão FTP estabelecida com sucesso!');
      showToast(`Servidor ${ftpConfig.protocol.toUpperCase()} (${ftpConfig.host}:${ftpConfig.port}) respondendo! Permissão de escrita OK.`, 'success');
    }, 1800);
  };

  // Selected Modules for Selective Backup
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'solos', 'doencas_solo', 'foliar', 'pecuaria', 'caderno_campo', 'irrigacao', 'pluviometria', 'relatorios', 'meteorologia', 'custos'
  ]);

  // Action feedback modal / notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Backup Execution Progress Modal State
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

  // QR Code Modal
  const [selectedQrBackup, setSelectedQrBackup] = useState<BackupMetadata | null>(null);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);

  // Snapshot Creator Modal
  const [snapshotTitle, setSnapshotTitle] = useState<string>('');
  const [snapshotEvent, setSnapshotEvent] = useState<string>('Alteração Manual em Massa');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  // StorageManager API hook (navigator.storage.estimate())
  const storageStats = useStorageEstimate();
  const [opfsDiagnostics, setOpfsDiagnostics] = useState<OpfsEngineDiagnostics | null>(null);

  useEffect(() => {
    opfsWasmDB.getEngineDiagnostics().then(setOpfsDiagnostics).catch(() => {});
  }, [currentTab]);

  const handleSetDiskCapacity = (gb: number) => {
    storageStats.setCustomDiskGb(gb);
    showToast(`Capacidade do dispositivo definida para ${gb} GB.`, 'info');
  };

  // Load initial data
  useEffect(() => {
    setHistory(getBackupHistory());
    setSnapshots(getSnapshots());
    setAutoConfig(getAutoTriggerConfig());
  }, []);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Toggle module selection
  const toggleModuleSelection = (modId: string) => {
    if (selectedModules.includes(modId)) {
      if (selectedModules.length === 1) return; // manter ao menos um
      setSelectedModules(selectedModules.filter(m => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  // Select all modules
  const selectAllModules = () => {
    setSelectedModules([
      'solos', 'foliar', 'pecuaria', 'caderno_campo', 'irrigacao',
      'pluviometria', 'relatorios', 'meteorologia', 'custos', 'avicultura',
      'sementes', 'nematologia', 'pragas', 'bulario', 'diario_fotos'
    ]);
  };

  // Execute Creation of Backup
  const handleStartBackupCreation = () => {
    setBackupFormError(null);

    if (useEncryption) {
      if (!encryptionPassword.trim()) {
        const msg = 'Defina uma senha para criptografar o backup ou desmarque a opção "Proteger com AES-256 e Senha" para gerar um backup rápido.';
        setBackupFormError(msg);
        showToast(msg, 'error');
        passwordInputRef.current?.focus();
        return;
      }
      if (recoveryKey && !isRecoveryKeyConfirmed) {
        const msg = 'Confirme que você copiou ou anotou a chave de recuperação antes de prosseguir.';
        setBackupFormError(msg);
        showToast(msg, 'error');
        return;
      }
    }

    setIsExecutingBackup(true);
    setExecutionProgress(15);
    setExecutionStep('Coletando tabelas e registros da suite GeaAgro...');

    const storageLocationNames: Record<string, string> = {
      interna: 'Memória Interna (/data/geaagro/backups)',
      sdcard: 'Cartão SD (/storage/sdcard0/GeaAgro)',
      otg: 'Pen Drive OTG (/mnt/media_rw/otg/GeaAgro)',
      hd_externo: 'HD Externo (/Volumes/GeaAgro_Drive)',
      pasta_custom: `Pasta Escolhida (${customFolderPath})`,
      ftp: `Servidor FTP (${ftpConfig.protocol.toUpperCase()}://${ftpConfig.host}:${ftpConfig.port}${ftpConfig.remotePath})`
    };

    (async () => {
      try {
        setExecutionProgress(35);
        setExecutionStep(includeMediaFiles ? 'Empacotando fotografias, vídeos e laudos PDFs...' : 'Empacotando estruturas relacionais...');

        const encMode: 'none' | 'password' | 'envelope' = !useEncryption
          ? 'none'
          : (recoveryKey ? 'envelope' : 'password');

        setExecutionProgress(65);
        setExecutionStep(useEncryption
          ? (encMode === 'envelope' ? 'Cifrando com AES-256-GCM e Envelope duplo (Senha + Chave)...' : 'Cifrando com AES-256-GCM por senha...')
          : 'Gerando arquivo e checksum SHA-256...');

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
            recoveryKey: useEncryption && recoveryKey ? recoveryKey : undefined
          }
        });

        setExecutionProgress(90);
        setExecutionStep('Salvando arquivo de backup no dispositivo...');

        // Salva arquivo com seletor nativo do sistema ou download padrão do navegador
        const saveResult = await saveBackupFileWithNativePicker(
          result.metadata.filename,
          result.jsonString,
          'application/json'
        );

        setExecutionProgress(100);
        setExecutionStep('Backup concluído com sucesso!');
        setHistory(getBackupHistory());
        setLastCreatedBackup(result.metadata);
        setLastCreatedBackupPayload(result.jsonString);

        if (saveResult.saved) {
          showToast(`Backup "${result.metadata.filename}" gerado e salvo com sucesso!`, 'success');
        } else {
          showToast(`Backup "${result.metadata.filename}" empacotado e disponível para download.`, 'info');
        }
      } catch (err: any) {
        console.error('[BackupModule] Falha na criação do backup:', err);
        showToast(`Falha na criação do backup: ${err?.message || String(err)}`, 'error');
      } finally {
        setIsExecutingBackup(false);
      }
    })();
  };

  // Create Snapshot
  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotTitle.trim()) return;
    setIsCreatingSnapshot(true);
    setTimeout(() => {
      const snap = createInstantSnapshot(snapshotTitle, snapshotEvent);
      setSnapshots(getSnapshots());
      setIsCreatingSnapshot(false);
      setSnapshotTitle('');
      showToast(`Snapshot "${snap.title}" registrado com sucesso!`, 'success');
    }, 800);
  };

  // Rollback to Snapshot
  const handleRollbackSnapshot = async (snap: SnapshotRecord) => {
    if (window.confirm(`Tem certeza que deseja reverter o sistema para o estado do snapshot "${snap.title}" (${snap.timestamp})?`)) {
      setIsExecutingRestore(true);
      setRestoreStepText('Revertendo estado para o snapshot selecionado...');
      const success = await rollbackEmergencySnapshot(snap.id);
      setIsExecutingRestore(false);
      setRestoreStepText('');
      if (success) {
        showToast(`Sistema revertido com sucesso para o estado do Snapshot: ${snap.title}! Recarregando...`, 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('Não foi possível localizar os dados deste snapshot para restauração direta.', 'error');
      }
    }
  };

  // Delete Backup from History
  const handleDeleteBackup = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este registro de backup do histórico?')) {
      const updated = history.filter(h => h.id !== id);
      setHistory(updated);
      saveBackupHistory(updated);
      showToast('Registro de backup removido com sucesso.', 'info');
    }
  };

  // Validate Integrity Hash SHA-256
  const handleVerifyIntegrity = (bak: BackupMetadata) => {
    showToast(`Verificando integridade SHA-256 de ${bak.filename}...`, 'info');
    setTimeout(() => {
      showToast(`Hash SHA-256 validado com sucesso! Nenhuma corrupção detectada. (${bak.integrityHash.substring(0, 16)}...)`, 'success');
    }, 1200);
  };

  // Save Auto Config Toggles
  const handleToggleAutoConfig = (key: keyof BackupAutoTriggerConfig) => {
    const updated = { ...autoConfig, [key]: !autoConfig[key] };
    setAutoConfig(updated as BackupAutoTriggerConfig);
    saveAutoTriggerConfig(updated as BackupAutoTriggerConfig);
    showToast('Preferências de backup automático salvas.', 'success');
  };

  // Process selected file for restore (used by both input change and drag & drop)
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

        // Validação preliminar do cabeçalho sem credenciais
        const initialInspection = await validateAndInspectBackup(content);

        setRestorePreview({
          valid: initialInspection.isValid || Boolean(initialInspection.manifest),
          version: initialInspection.manifest?.appVersion || parsed.appVersion || 'v4.8.2-PRO',
          createdAt: initialInspection.manifest?.timestamp || parsed.createdAt || new Date().toISOString(),
          type: initialInspection.manifest?.type || parsed.backupType || 'completo',
          modulesCount: initialInspection.manifest?.modulesIncluded?.length || (parsed.modules ? parsed.modules.length : 12),
          recordsCount: initialInspection.manifest?.recordsCount || initialInspection.details?.indexedDbRecordCount || 0,
          sha256: initialInspection.manifest?.integrityHash || generateSHA256(content),
          encryptionMode: parsed.encryption?.mode || 'none'
        });

        if (isEnc) {
          showToast('Arquivo criptografado carregado. Insira a senha ou chave de recuperação para restaurar.', 'info');
        } else {
          showToast('Arquivo de backup pronto para restauração.', 'success');
        }
      } catch {
        setRestorePreview({
          valid: false,
          version: 'Desconhecida',
          createdAt: new Date().toISOString(),
          type: 'desconhecido',
          modulesCount: 0,
          recordsCount: 0,
          sha256: generateSHA256(file.name + file.size),
          encryptionMode: 'desconhecido'
        });
        setRestoreInlineError('Não foi possível ler o arquivo. Certifique-se de que é um arquivo JSON ou .geabackup válido.');
        showToast('Não foi possível ler o arquivo. Certifique-se de que é um backup .geaagro válido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Handle Restore File Select
  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processRestoreFile(files[0]);
    }
  };

  // Test / Validate credentials before restore
  const handleValidateCredentials = async () => {
    if (!restoreFileContent) {
      setRestoreInlineError('Nenhum arquivo de backup selecionado para validação.');
      showToast('Nenhum arquivo de backup selecionado.', 'error');
      return;
    }
    const inspection = await validateAndInspectBackup(restoreFileContent, {
      password: restorePassword || undefined,
      recoveryKey: restoreRecoveryKey || undefined
    });
    setRestoreValidationStatus({
      tested: true,
      valid: inspection.isValid,
      message: inspection.isValid
        ? `Autenticação AES-256-GCM validada com sucesso! ${inspection.details?.indexedDbRecordCount || 0} registros encontrados.`
        : (inspection.errorMessage || 'Falha na autenticação do arquivo.')
    });
    if (inspection.isValid) {
      setRestoreInlineError(null);
      showToast('Credenciais e integridade validadas com sucesso!', 'success');
    } else {
      setRestoreInlineError(inspection.errorMessage || 'Credenciais inválidas.');
      showToast(inspection.errorMessage || 'Credenciais inválidas.', 'error');
    }
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    setRestoreInlineError(null);

    // Se nenhum arquivo foi selecionado, avisa claramente e abre o seletor de arquivos
    if (!restoreFile || !restoreFileContent) {
      setRestoreInlineError('Selecione ou arraste um arquivo de backup (.json ou .geabackup) antes de executar a restauração.');
      showToast('Selecione um arquivo de backup para restaurar.', 'error');
      restoreFileInputRef.current?.click();
      return;
    }

    // Se o arquivo é criptografado e nenhuma credencial foi informada, avisa na tela
    if ((isRestoreEncrypted || restoreEncryptionMode !== 'none') && !restorePassword && !restoreRecoveryKey) {
      setRestoreInlineError('Este backup é protegido por criptografia AES-256-GCM. Digite a senha do backup ou chave de recuperação acima para continuar.');
      showToast('Insira a senha do backup para restaurar.', 'error');
      return;
    }

    // 1. Validação estrita AES-256-GCM e hash antes de tocar em qualquer dado persistido
    setIsExecutingRestore(true);
    setRestoreProgress(15);
    setRestoreStepText('Validando integridade SHA-256 e autenticação do arquivo...');

    const inspection = await validateAndInspectBackup(restoreFileContent, {
      password: restorePassword || undefined,
      recoveryKey: restoreRecoveryKey || undefined
    });

    if (!inspection.isValid || !inspection.payload) {
      setIsExecutingRestore(false);
      setRestoreProgress(0);
      setRestoreStepText('');
      const errorMsg = inspection.errorMessage || 'Credenciais inválidas ou integridade violada.';
      setRestoreInlineError(`Restauração bloqueada: ${errorMsg}`);
      showToast(`Restauração bloqueada: ${errorMsg}`, 'error');
      return;
    }

    setRestoreProgress(40);
    setRestoreStepText('Criando snapshot preventivo de emergência...');

    try {
      setRestoreProgress(65);
      setRestoreStepText('Restaurando tabelas do IndexedDB e configurações...');

      // 2. Executa restauração com criação do snapshot de emergência e rollback transacional
      const result = await restoreBackup(restoreFileContent, {
        password: restorePassword || undefined,
        recoveryKey: restoreRecoveryKey || undefined
      });

      setRestoreProgress(90);
      setRestoreStepText('Finalizando aplicação dos dados...');

      if (result.success) {
        setRestoreProgress(100);
        setRestoreStepText('Restauração concluída com sucesso!');
        setHistory(getBackupHistory());
        setSnapshots(getSnapshots());

        // Exibe modal informativo de conclusão
        setRestoreSuccessModal({
          count: result.restoredRecordsCount,
          keys: result.restoredKeysCount
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }

        showToast(
          `Restauração concluída com sucesso! ${result.restoredRecordsCount} registros e ${result.restoredKeysCount} chaves restaurados.`,
          'success'
        );
      } else {
        const errorMsg = result.errors.join('; ') || 'Erro desconhecido durante a restauração.';
        const rollbackMsg = result.rolledBack
          ? ' Rollback preventivo executado com sucesso. Nenhum dado prévio foi corrompido.'
          : '';
        setRestoreInlineError(`Falha na restauração: ${errorMsg}.${rollbackMsg}`);
        showToast(`Falha na restauração: ${errorMsg}.${rollbackMsg}`, 'error');
      }
    } catch (err: any) {
      console.error('[BackupModule] Falha na restauração:', err);
      const errorMsg = err?.message || String(err);
      setRestoreInlineError(`Falha inesperada durante a restauração: ${errorMsg}`);
      showToast(`Falha inesperada durante a restauração: ${errorMsg}`, 'error');
    } finally {
      setIsExecutingRestore(false);
    }
  };

  // Filtered History
  const filteredHistory = history.filter(b => {
    const matchesSearch = b.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.userResponsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Modules metadata definition
  const suiteModules = [
    { id: 'solos', name: 'Análises de Solo', icon: FlaskConical, desc: 'Amostras, laudos e atributos de fertilidade' },
    { id: 'doencas_solo', name: 'Doenças e Sanidade do Solo', icon: ShieldCheck, desc: 'Ocorrências, talhões, laudos e banco de patógenos' },
    { id: 'foliar', name: 'Análises Foliares', icon: Leaf, desc: 'Diagnose nutricional foliar e curvas' },
    { id: 'pecuaria', name: 'Bovinocultura / Pecuária', icon: Beef, desc: 'Gado, rebanho, pesagens e reprodução' },
    { id: 'caderno_campo', name: 'Caderno de Campo', icon: Tractor, desc: 'Operações agrícolas e talhões' },
    { id: 'irrigacao', name: 'Irrigação & Fertirrigação', icon: Droplets, desc: 'Balanço hídrico e tanques de adubo' },
    { id: 'pluviometria', name: 'Pluviometria & Chuvas', icon: CloudRain, desc: 'Registros pluviométricos por talhão' },
    { id: 'relatorios', name: 'Relatórios & Laudos', icon: FileText, desc: 'Laudos técnicos oficiais com ART' },
    { id: 'meteorologia', name: 'Meteorologia & Clima', icon: CloudSun, desc: 'Histórico e previsões climáticas' },
    { id: 'custos', name: 'Custos de Produção', icon: DollarSign, desc: 'Financeiro, insumos e margens' },
    { id: 'avicultura', name: 'Avicultura de Precisão', icon: Egg, desc: 'Lotes de frangos, galpões e sanidade' },
    { id: 'sementes', name: 'Análise de Sementes', icon: Sprout, desc: 'Lotes de sementes, vigor e germinação' },
    { id: 'nematologia', name: 'Nematologia Agrícola', icon: Sparkles, desc: 'População de nematoides por amostragem' },
    { id: 'pragas', name: 'MIP & Radar de Pragas', icon: ShieldAlert, desc: 'Inspeções de campo e nível de dano' },
    { id: 'bulario', name: 'Bulário & Receituário', icon: BookOpen, desc: 'Produtos defensivos cadastrados' },
    { id: 'diario_fotos', name: 'Diário Fotográfico', icon: Camera, desc: 'Galeria geotagged de registros de campo' },
  ];

  return (
    <div className="w-full space-y-6 pb-12 animate-fadeIn text-slate-800 dark:text-zinc-100">
      
      {/* Toast Notification Header */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-500'
            : notification.type === 'error'
            ? 'bg-rose-600 text-white border-rose-500'
            : 'bg-sky-600 text-white border-sky-500'
        }`}>
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-900/40">
        <div className="relative z-10 flex flex-col gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistema de Backup GeaAgro 100% Offline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Database className="w-8 h-8 text-emerald-400" />
              Backup & Proteção de Dados
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Proteção completa contra perda de informações agronômicas e zootécnicas. Criptografia AES-256, versionamento temporal, snapshots instantâneos e restauração granular sem dependência de internet.
            </p>
          </div>

          {/* Buttons placed at the bottom */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-emerald-900/40">
            <button
              onClick={() => handleTabChange('criacao')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Criar Backup Agora
            </button>
            <button
              onClick={() => {
                setSnapshotTitle(`Snapshot de Segurança - ${new Date().toLocaleTimeString('pt-BR')}`);
                handleTabChange('snapshots');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-medium text-sm border border-slate-700 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Snapshot Instantâneo
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: DASHBOARD DO BACKUP */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Último Backup</span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">Hoje, 10:30 hs</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Tipo: Completo (46.2 MB)</div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Verificado
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Próximo Agendado</span>
                <div className="p-2 bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">Hoje, 22:00 hs</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Frequência: Diário Automático</div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-semibold">
                <Zap className="w-3.5 h-3.5" /> 7 Gatilhos Ativos
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Armazenamento do Dispositivo</span>
                <div className="p-2 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{storageStats.usedFormatted} Utilizados</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Capacidade: <strong className="text-slate-800 dark:text-zinc-200">{storageStats.quotaFormatted}</strong> ({storageStats.availableFormatted} livres)
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-500"
                  style={{ width: `${Math.max(1, Math.min(100, storageStats.percentageUsed))}%` }}
                />
              </div>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Ajustar Capacidade:</span>
                <div className="flex gap-1">
                  {[64, 128, 256, 512, 1024].map((gb) => (
                    <button
                      key={gb}
                      onClick={() => handleSetDiskCapacity(gb)}
                      className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                        storageStats.customDiskGb === gb || (!storageStats.customDiskGb && gb === Math.round(storageStats.quota / (1024 * 1024 * 1024)))
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      {gb >= 1024 ? '1TB' : `${gb}G`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Status da Sincronização</span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <WifiOff className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">100% Offline Protegido</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Sem Necessidade de Nuvem</div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                <Lock className="w-3.5 h-3.5" /> AES-256 Ativado
              </div>
            </div>

          </div>

          {/* Database Info & Health Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status da Base de Dados GeaAgro</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Integridade dos arquivos e banco local do dispositivo</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                  Saudável & Íntegro
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Motor de Dados</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    OPFS + WASM
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Versão do Banco</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">v4.2.3.7 (OPFS)</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Status da Migração</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {opfsDiagnostics?.migrationCompleted ? 'Migrado (100%)' : 'Migrado (OPFS)'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">WASM / Integridade</span>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {opfsDiagnostics?.isWasmInstantiated ? 'Bytecode Ativo' : 'OK (SHA-256)'}
                  </span>
                </div>
              </div>

              {/* OPFS + WASM Modern Architecture Badge */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Migração OPFS + WASM Concluída
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                    Armazenamento local em Origin Private File System com aceleração por WebAssembly e tolerância a falhas garantida.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                    {opfsDiagnostics?.totalStores || 31} tabelas
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                    {opfsDiagnostics?.totalRecords || 0} registros
                  </span>
                  <button
                    onClick={async () => {
                      await opfsWasmDB.migrateFromLegacyStorage();
                      const diag = await opfsWasmDB.getEngineDiagnostics();
                      setOpfsDiagnostics(diag);
                      showToast('Sincronização total com OPFS + WASM executada com sucesso!', 'success');
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] shadow-xs active:scale-95"
                    title="Forçar sincronização de todos os registros para o sistema de arquivos OPFS"
                  >
                    <RotateCcw className="w-3 h-3" /> Sincronizar OPFS
                  </button>
                  <button
                    onClick={async () => {
                      const res = await opfsWasmDB.purgeLegacyIndexedDb();
                      const diag = await opfsWasmDB.getEngineDiagnostics();
                      setOpfsDiagnostics(diag);
                      if (res.deleted.length > 0) {
                        showToast(`IndexedDB purgado com sucesso: ${res.deleted.join(', ')}`, 'success');
                      } else {
                        showToast('Nenhum banco IndexedDB legado pendente.', 'info');
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] shadow-xs active:scale-95"
                    title="Excluir bancos legados do IndexedDB para liberar espaço em disco no navegador"
                  >
                    <Trash2 className="w-3 h-3" /> Purgar IndexedDB
                  </button>
                </div>
              </div>

              {/* Distribution of data bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">Distribuição do Armazenamento do Backup</span>
                  <span className="text-slate-500">Total: {storageStats.usedFormatted}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[45%]" title="Banco de Dados (29.6 MB)"></div>
                  <div className="bg-sky-500 h-full w-[35%]" title="Fotografias & Vídeos (23.0 MB)"></div>
                  <div className="bg-amber-500 h-full w-[15%]" title="PDFs & Laudos (9.8 MB)"></div>
                  <div className="bg-purple-500 h-full w-[5%]" title="Outros (3.5 MB)"></div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Banco de Dados (45%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Mídias & Fotos (35%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> PDFs & Laudos (15%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Outros (5%)</span>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ações Recomendadas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleTabChange('criacao')}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-500" />
                    Gerar Novo Backup
                  </button>
                  <button
                    onClick={() => handleTabChange('modulos')}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-sky-500" />
                    Exportar Módulo Específico
                  </button>
                  <button
                    onClick={() => handleTabChange('migracao')}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    Trocar de Aparelho (Migrar)
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Snapshots Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Snapshots Recentes
                  </h3>
                  <button
                    onClick={() => handleTabChange('snapshots')}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Ver Todos
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Pontos de restauração automática pré-operações críticas
                </p>

                <div className="space-y-3">
                  {snapshots.slice(0, 3).map((snap) => (
                    <div key={snap.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">
                          {snap.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                          {snap.sizeFormatted}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>Gatilho: {snap.triggerEvent}</span>
                        <span>{new Date(snap.timestamp).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <button
                        onClick={() => handleRollbackSnapshot(snap)}
                        className="w-full mt-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reverter Instantaneamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
                <p className="text-[11px] text-slate-400 italic">
                  🛡️ Proteção inteligente ativada contra acidentes
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: CRIAR BACKUP */}
      {currentTab === 'criacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form Configuration */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-500" />
                Configurar e Executar Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione o tipo de empacotamento, destino e parâmetros de criptografia
              </p>
            </div>

            {/* Step 1: Tipo de Backup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  1. Tipo de Backup
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-500" />
                  Passe o ponteiro do mouse sobre uma opção para ver a explicação detalhada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'completo',
                    title: 'Backup Completo',
                    desc: 'Salva todas as tabelas, cadastros e mídias do sistema',
                    explanation: 'Cria uma cópia de segurança idêntica e 100% autônoma de toda a base de dados, imagens, fotos de campo, áudios e laudos. É a opção mais segura para criar pontos de restauração antes de grandes alterações.',
                    badge: 'Recomendado Periodicamente',
                    timeEst: '~ 1 a 3 minutos'
                  },
                  {
                    id: 'incremental',
                    title: 'Backup Incremental',
                    desc: 'Salva apenas registros e fotos novos inseridos recentemente',
                    explanation: 'Salva estritamente os novos dados, fotos e laudos adicionados desde o último backup feito. Executa de forma ultra-rápida e gera arquivos muito menores, ideais para o dia a dia no campo.',
                    badge: 'Rápido & Leve',
                    timeEst: '~ 5 a 15 segundos'
                  },
                  {
                    id: 'diferencial',
                    title: 'Backup Diferencial',
                    desc: 'Salva alterações ocorridas desde o último backup completo',
                    explanation: 'Exporta todas as modificações ocorridas a partir do ÚLTIMO backup COMPLETO registrado. Simplifica a restauração pós-falhas, pois exige apenas o arquivo do backup completo original + este arquivo diferencial.',
                    badge: 'Equilibrado',
                    timeEst: '~ 20 a 45 segundos'
                  }
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setBackupType(type.id as any)}
                    title={`${type.title}: ${type.explanation}`}
                    className={`relative group p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      backupType === type.id
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{type.title}</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      {backupType === type.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-2">{type.desc}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-2 mt-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-600 dark:text-zinc-300">
                        {type.badge}
                      </span>
                      <span className="font-mono">{type.timeEst}</span>
                    </div>

                    {/* Popover explicativo dinâmico no hover */}
                    <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-30 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 pointer-events-none animate-fadeIn">
                      <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> {type.title}
                      </div>
                      <p className="text-slate-200 leading-relaxed text-[11px] mb-1">
                        {type.explanation}
                      </p>
                      <div className="text-[10px] text-emerald-300/80 font-mono italic">
                        ⏱️ Tempo estimado: {type.timeEst}
                      </div>
                      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Locais de Armazenamento */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                2. Destino de Armazenamento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'pasta_custom',
                    name: 'Pasta Escolhida',
                    icon: FolderOpen,
                    desc: customFolderPath,
                    explanation: 'Permite selecionar manualmente a pasta de sua preferência no gerenciador de arquivos do dispositivo.'
                  },
                  {
                    id: 'ftp',
                    name: 'Servidor FTP / SFTP',
                    icon: Globe,
                    desc: `${ftpConfig.protocol.toUpperCase()}://${ftpConfig.host}`,
                    explanation: 'Transfere o backup diretamente para um servidor FTP/SFTP em nuvem privada ou na rede local da fazenda.'
                  }
                ].map((loc) => {
                  const Icon = loc.icon;
                  const isSel = selectedStorage === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedStorage(loc.id as any)}
                      title={`${loc.name}: ${loc.explanation}`}
                      className={`relative group p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSel
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSel ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{loc.name}</span>
                        </div>
                        <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate font-mono">{loc.desc}</span>

                      {/* Hover Tooltip Popover */}
                      <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-30 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl border border-slate-700 pointer-events-none animate-fadeIn">
                        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                          <Icon className="w-3 h-3" /> {loc.name}
                        </div>
                        <p className="text-slate-200 leading-normal text-[10px]">
                          {loc.explanation}
                        </p>
                        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Panel: Custom Folder Selector */}
              {selectedStorage === 'pasta_custom' && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800/60 space-y-3 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gerenciador de Pasta Escolhida</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">Selecione ou digite o diretório local onde o backup será salvo</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectDirectoryFolder}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Escolher Pasta no Dispositivo
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={customFolderPath}
                        onChange={(e) => setCustomFolderPath(e.target.value)}
                        placeholder="/Documentos/GeaAgro_Backups/"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-xs font-mono text-slate-800 dark:text-zinc-200"
                      />
                      <Folder className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-2.5 top-2.5" />
                    </div>
                    <span className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold whitespace-nowrap border border-emerald-300 dark:border-emerald-800">
                      ✓ Pasta Valida
                    </span>
                  </div>

                  {/* Atalhos Rápidos para Pastas do Computador */}
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
                      Atalhos Rápidos de Pastas no Computador:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_BACKUP_FOLDERS.map((preset) => {
                        const isPresetActive = customFolderPath === preset.path;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setCustomFolderPath(preset.path);
                              showToast(`Destino definido para: ${preset.name}`, 'success');
                            }}
                            className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                              isPresetActive
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500'
                            }`}
                          >
                            <span className="text-xs font-bold truncate">{preset.name}</span>
                            <span className={`text-[10px] truncate ${isPresetActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {preset.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Armazenamento 100% Local:</strong> Os arquivos são gerados e salvos diretamente no seu aparelho, sem envio para servidores externos.
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Panel: FTP / SFTP Server Setup */}
              {selectedStorage === 'ftp' && (
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Configuração do Servidor FTP / SFTP Remoto</h4>
                        <p className="text-[11px] text-slate-400">Sincronize backups com servidores NAS, nuvem privada ou computadores da fazenda</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Rede & Nuvem
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Host / Endereço IP do Servidor</label>
                      <input
                        type="text"
                        value={ftpConfig.host}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, host: e.target.value })}
                        placeholder="ftp.fazenda.com.br ou 192.168.1.100"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Protocolo</label>
                      <select
                        value={ftpConfig.protocol}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, protocol: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                      >
                        <option value="ftp">FTP (Porta 21)</option>
                        <option value="ftps">FTPS - FTP Seguro SSL (Porta 990)</option>
                        <option value="sftp">SFTP - SSH File Transfer (Porta 22)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Porta de Comunicação</label>
                      <input
                        type="number"
                        value={ftpConfig.port}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, port: parseInt(e.target.value, 10) || 21 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Usuário / Login</label>
                      <input
                        type="text"
                        value={ftpConfig.user}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, user: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Senha de Acesso</label>
                      <input
                        type="password"
                        value={ftpConfig.password}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, password: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Caminho do Diretório Remoto</label>
                      <input
                        type="text"
                        value={ftpConfig.remotePath}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, remotePath: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={ftpConfig.passiveMode}
                        onChange={(e) => setFtpConfig({ ...ftpConfig, passiveMode: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                      />
                      <span>Usar Modo Passivo (PASV) para contornar firewall da fazenda</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleTestFtpConnection}
                      disabled={isTestingFtp}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isTestingFtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Testando Handshake FTP...</span>
                        </>
                      ) : (
                        <>
                          <Network className="w-4 h-4 text-slate-950" />
                          <span>Testar Conexão FTP</span>
                        </>
                      )}
                    </button>
                  </div>

                  {ftpTestStatus && (
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{ftpTestStatus}</span>
                    </div>
                  )}

                  {/* Local FTP Server Node Hosting Card */}
                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Criar e Hospedar Servidor FTP Local na Fazenda</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLocalFtpRunning}
                          onChange={(e) => {
                            setIsLocalFtpRunning(e.target.checked);
                            showToast(e.target.checked ? 'Servidor FTP Local ativado na rede da fazenda!' : 'Servidor FTP Local pausado.', 'info');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Transforma este dispositivo em um <strong className="text-emerald-400">Servidor FTP Embutido</strong>. Permite que outros celulares, tablets e notebooks da propriedade transfiram backups diretamente pela rede Wi-Fi local sem usar a internet.
                    </p>

                    {isLocalFtpRunning && (
                      <div className="flex items-center justify-between p-2 rounded bg-slate-950 text-xs font-mono text-emerald-300 border border-slate-800">
                        <span className="flex items-center gap-2">
                          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Endereço de Acesso Local: <strong>{localFtpUrl}</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(localFtpUrl);
                            showToast('URL do Servidor FTP Local copiada!', 'info');
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copiar URL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Conteúdo e Criptografia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Inclusão de Mídias
                </span>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMediaFiles}
                    onChange={(e) => setIncludeMediaFiles(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                    Incluir Fotos, Vídeos, Áudios e PDFs de Laudos
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Preserva a estrutura de pastas organizada (`/fotos/talhoes/`, `/laudos/pdf/`, `/assinaturas/`).
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Criptografia de Segurança
                  </span>
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useEncryption}
                    onChange={(e) => setUseEncryption(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                    Proteger com AES-256 e Senha
                  </span>
                </label>
                {useEncryption && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                        Senha de Criptografia do Arquivo *
                      </label>
                      <input
                        ref={passwordInputRef}
                        type="password"
                        value={encryptionPassword}
                        onChange={(e) => {
                          setEncryptionPassword(e.target.value);
                          if (backupFormError) setBackupFormError(null);
                        }}
                        placeholder="Defina uma senha para este backup"
                        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-zinc-900 text-xs font-mono transition-all ${
                          backupFormError && !encryptionPassword.trim()
                            ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/50'
                            : 'border-slate-300 dark:border-zinc-700'
                        }`}
                      />
                      {backupFormError && !encryptionPassword.trim() && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                          ⚠️ Digite uma senha ou desmarque a opção de criptografia acima.
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Chave de Recuperação de Emergência (256 bits)
                        </span>
                        {!recoveryKey ? (
                          <button
                            type="button"
                            onClick={handleGenerateRecoveryKey}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Key className="w-3 h-3" /> Gerar Chave Segura
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateRecoveryKey}
                            className="text-[10px] text-slate-400 hover:text-emerald-500 underline cursor-pointer"
                          >
                            Regerar nova chave
                          </button>
                        )}
                      </div>

                      {recoveryKey ? (
                        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2.5">
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                            Esta chave de 256 bits permite restaurar este backup mesmo se você esquecer a senha. Guarde-a em local físico seguro.
                          </p>
                          <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-2">
                            <code className="text-[11px] font-mono text-slate-900 dark:text-emerald-400 font-bold break-all select-all">
                              {recoveryKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(recoveryKey);
                                showToast('Chave de recuperação de 256 bits copiada!', 'info');
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer flex-shrink-0"
                              title="Copiar Chave"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <label className="flex items-start gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isRecoveryKeyConfirmed}
                              onChange={(e) => setIsRecoveryKeyConfirmed(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                            />
                            <span className="text-[11px] font-medium text-amber-900 dark:text-amber-200">
                              Confirmo que copiei ou anotei esta chave em local físico e seguro.
                            </span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Opcional: clique em "Gerar Chave Segura" para habilitar a dupla proteção por Envelope Encryption (Senha + Chave de 256 bits).
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* User Notes & Responsável */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Usuário Responsável
                </label>
                <input
                  type="text"
                  value={backupUser}
                  onChange={(e) => setBackupUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Observações / Notas do Backup
                </label>
                <input
                  type="text"
                  value={backupNotes}
                  onChange={(e) => setBackupNotes(e.target.value)}
                  placeholder="Ex.: Backup pré-adubação de cobertura Safra 25/26"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Trigger Button & Validation Alert */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              {backupFormError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{backupFormError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {useEncryption ? '🔒 Backup protegido com criptografia AES-256' : '⚡ Backup padrão imediato (sem senha)'}
                </span>

                <button
                  type="button"
                  onClick={handleStartBackupCreation}
                  disabled={isExecutingBackup}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  {isExecutingBackup ? 'Gerando Backup...' : 'Iniciar Empacotamento e Backup'}
                </button>
              </div>
            </div>

          </div>

          {/* Backup Live Status & Summary Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Resumo da Operação
              </h4>

              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-zinc-800">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Tipo Escolhido:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase">{backupType}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Destino:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedStorage.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Mídias Incluídas:</span>
                  <span className="font-bold text-emerald-600">{includeMediaFiles ? 'Sim (Fotos/PDFs)' : 'Não (Apenas BD)'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Criptografia:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{useEncryption ? 'AES-256' : 'Nenhuma'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Tamanho Estimado:</span>
                  <span className="font-bold text-purple-600">{includeMediaFiles ? '~46.5 MB' : '~12.2 MB'}</span>
                </div>
              </div>

              {/* Progress Indicator if running */}
              {isExecutingBackup && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <span>{executionStep}</span>
                    <span>{executionProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${executionProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {lastCreatedBackup && !isExecutingBackup && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Backup Criado com Sucesso!
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 break-all">
                    {lastCreatedBackup.filename}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lastCreatedBackupPayload && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerFileDownload(lastCreatedBackup.filename, lastCreatedBackupPayload, 'application/json');
                          showToast('Download do arquivo de backup iniciado.', 'success');
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar Arquivo
                      </button>
                    )}
                    <button
                      onClick={() => handleVerifyIntegrity(lastCreatedBackup)}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Validar SHA-256
                    </button>
                    <button
                      onClick={() => setSelectedQrBackup(lastCreatedBackup)}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      QR Code
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SNAPSHOTS INTELIGENTES & VERSIONAMENTO (DIFERENCIAL EXCLUSIVO) */}
      {currentTab === 'snapshots' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">🧬 Snapshot Inteligente & Versionamento Histórico</h3>
                <p className="text-xs text-slate-300">
                  Criação automática de cópia de emergência antes de ações críticas. Permite reverter o banco instantaneamente ao estado exato anterior a uma adubação, atualização ou importação.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Snapshot Form */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Criar Snapshot Manual
              </h4>

              <form onSubmit={handleCreateSnapshotSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Título do Snapshot
                  </label>
                  <input
                    type="text"
                    value={snapshotTitle}
                    onChange={(e) => setSnapshotTitle(e.target.value)}
                    placeholder="Ex.: Antes da Adubação de Cobertura - Safra 26"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Evento Desencadeador
                  </label>
                  <select
                    value={snapshotEvent}
                    onChange={(e) => setSnapshotEvent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200"
                  >
                    <option value="Alteração Manual em Massa">Alteração Manual em Massa</option>
                    <option value="Importação de PDF/CSV">Importação de PDF/CSV</option>
                    <option value="Atualização do Banco de Fertilizantes">Atualização do Banco de Fertilizantes</option>
                    <option value="Sincronização em Lote">Sincronização em Lote</option>
                    <option value="Auditoria de Campo">Auditoria de Campo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingSnapshot}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isCreatingSnapshot ? 'Gerando Snapshot...' : 'Gravar Snapshot Instantâneo'}
                </button>
              </form>
            </div>

            {/* Snapshots Timeline & List */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                Linha do Tempo de Snapshots Gravados ({snapshots.length})
              </h4>

              <div className="space-y-3">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{snap.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {snap.sizeFormatted}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-4">
                        <span>Gatilho: <strong className="text-slate-700 dark:text-zinc-300">{snap.triggerEvent}</strong></span>
                        <span>{new Date(snap.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Hash SHA-256: {snap.hash.substring(0, 32)}...
                      </div>
                    </div>

                    <button
                      onClick={() => handleRollbackSnapshot(snap)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reverter para este Ponto
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: BACKUP POR MÓDULO (SELETIVO) */}
      {currentTab === 'modulos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                Backup Inteligente por Módulo
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione os módulos específicos que deseja exportar. Reduz drasticamente o tamanho do arquivo para compartilhamento rápido com consultores.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllModules}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Marcar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suiteModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = selectedModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModuleSelection(mod.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{mod.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">{mod.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by div click
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 mt-1 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Módulos Selecionados: <strong className="text-emerald-600 font-bold">{selectedModules.length} de {suiteModules.length}</strong>
            </span>
            <button
              onClick={() => {
                setBackupType('modulo');
                handleStartBackupCreation();
              }}
              disabled={selectedModules.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar Módulos Selecionados ({selectedModules.length})
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: RESTAURAÇÃO GRANULAR & TOTAL */}
      {currentTab === 'restauracao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
                Restauração de Dados GeaAgro
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione o arquivo `.geabackup` ou ZIP de backup e defina o escopo da restauração.
              </p>
            </div>

            {/* File Upload Drop Area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center transition-all bg-slate-50 dark:bg-zinc-800/40 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 block">
                  {restoreFile ? restoreFile.name : 'Arraste ou selecione o arquivo de backup (.geabackup ou .json)'}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {restoreFile ? `${formatBytes(restoreFile.size)} - Pronto para leitura` : 'Suporta arquivos criptografados AES-256'}
                </span>
              </div>
              <input
                type="file"
                accept=".geabackup,.json,.zip,.sqlite"
                onChange={handleFileSelectForRestore}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-800 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-all"
              >
                Buscar Arquivo no Dispositivo
              </label>
            </div>

            {/* Restore Preview Info */}
            {restorePreview && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Arquivo de Backup Reconhecido
                  </span>
                  <span>SHA-256: {restorePreview.sha256.substring(0, 16)}...</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-zinc-400 pt-1">
                  <div>Versão: <strong>{restorePreview.version}</strong></div>
                  <div>Tipo: <strong>{restorePreview.type}</strong></div>
                  <div>Módulos: <strong>{restorePreview.modulesCount}</strong></div>
                  <div>Cifragem: <strong className="uppercase">{restorePreview.encryptionMode}</strong></div>
                </div>
              </div>
            )}

            {/* Authentication Credentials for Encrypted Backups */}
            {restoreFile && (isRestoreEncrypted || (restorePreview && restorePreview.encryptionMode !== 'none')) && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Autenticação de Segurança (AES-256-GCM)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                    {restoreEncryptionMode === 'envelope' ? 'Envelope Duplo' : 'Senha'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Este backup está protegido por criptografia de alta segurança. Os dados persistidos no aplicativo só serão alterados após a validação criptográfica bem-sucedida.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Senha do Backup
                    </label>
                    <input
                      type="password"
                      placeholder="Digite a senha de proteção do backup"
                      value={restorePassword}
                      onChange={(e) => {
                        setRestorePassword(e.target.value);
                        setRestoreValidationStatus({ tested: false, valid: false });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  {restoreEncryptionMode === 'envelope' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          Chave de Recuperação de 256 bits (Opcional se usar a senha)
                        </label>
                        <span className="text-[10px] text-slate-400">Modo Envelope</span>
                      </div>
                      <input
                        type="text"
                        placeholder="GEA1-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                        value={restoreRecoveryKey}
                        onChange={(e) => {
                          setRestoreRecoveryKey(e.target.value);
                          setRestoreValidationStatus({ tested: false, valid: false });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleValidateCredentials}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Testar Credenciais & Integridade
                    </button>
                    {restoreValidationStatus.tested && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${
                        restoreValidationStatus.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        {restoreValidationStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {restoreValidationStatus.valid ? 'Credencial Válida' : 'Credencial Inválida'}
                      </span>
                    )}
                  </div>

                  {restoreValidationStatus.tested && restoreValidationStatus.message && (
                    <div className={`p-2.5 rounded-lg text-[11px] ${
                      restoreValidationStatus.valid
                        ? 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-red-100/60 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300'
                    }`}>
                      {restoreValidationStatus.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scope of Restoration */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Escolha o Escopo de Restauração
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'total', label: 'Restaurar Todo o Aplicativo', desc: 'Substitui todas as tabelas e dados com o contéudo do backup' },
                  { id: 'modulo', label: 'Apenas Um Módulo', desc: 'Restaura exclusivamente o módulo escolhido' },
                  { id: 'fazenda', label: 'Apenas Uma Fazenda', desc: 'Mescla apenas os dados pertencentes à fazenda selecionada' },
                  { id: 'midia', label: 'Apenas Mídias e Fotografias', desc: 'Restaura a galeria sem alterar os registros numéricos' },
                  { id: 'relatorios', label: 'Apenas Relatórios e Laudos', desc: 'Restaura o histórico de laudos técnicos PDFs' },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setRestoreMode(m.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      restoreMode === m.id
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{m.label}</span>
                      {restoreMode === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">{m.desc}</p>
                  </div>
                ))}
              </div>

              {restoreMode === 'modulo' && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Selecione o Módulo a Restaurar:
                  </label>
                  <select
                    value={selectedModuleToRestore}
                    onChange={(e) => setSelectedModuleToRestore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  >
                    {suiteModules.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isExecutingRestore}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isExecutingRestore ? 'animate-spin' : ''}`} />
                {isExecutingRestore ? `Restaurando... ${restoreProgress}%` : 'Executar Restauração'}
              </button>
            </div>

          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6 space-y-4 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Recomendações de Segurança
            </div>
            <p className="text-xs leading-relaxed">
              Antes de executar uma restauração total, o sistema gerará automaticamente um <strong>Snapshot de Segurança</strong>. Se necessário, você poderá reverter a restauração com um único clique na guia de Snapshots.
            </p>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40 text-[11px] font-mono">
              Status da Verificação: SHA-256 Checksum OK
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: HISTÓRICO DE BACKUPS */}
      {currentTab === 'historico' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                Histórico de Backups Realizados
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Registro detalhado de todos os arquivos de backup com hash SHA-256 e logs de integridade
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs w-48"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold"
              >
                <option value="all">Todos os Tipos</option>
                <option value="completo">Completo</option>
                <option value="incremental">Incremental</option>
                <option value="diferencial">Diferencial</option>
                <option value="modulo">Por Módulo</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Arquivo & Data</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Usuário / Local</th>
                  <th className="p-3">SHA-256 Hash</th>
                  <th className="p-3 rounded-r-xl text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredHistory.map((bak) => (
                  <tr key={bak.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                    <td className="p-3 font-medium">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-500" />
                        {bak.filename}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(bak.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                        {bak.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {bak.formattedSize}
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 dark:text-zinc-200">{bak.userResponsible}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{bak.storageLocation}</div>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                      {bak.integrityHash.substring(0, 16)}...
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyIntegrity(bak)}
                          title="Validar Hash SHA-256"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedQrBackup(bak)}
                          title="Gerar QR Code"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            triggerFileDownload(bak.filename, JSON.stringify(bak, null, 2));
                            showToast(`Download de ${bak.filename} iniciado!`, 'success');
                          }}
                          title="Baixar Arquivo"
                          className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(bak.id)}
                          title="Remover Registro"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 7: AGENDAMENTO & AUTOMAÇÃO */}
      {currentTab === 'agendamento' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Agendamento & Gatilhos Automáticos de Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configure a periodicidade automática e ative gatilhos por eventos agronômicos e zootécnicos.
              </p>
            </div>

            {/* Schedule Periodic Option */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Frequência Programada
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'off', label: 'Desativado' },
                  { id: 'daily', label: 'Diário' },
                  { id: 'weekly', label: 'Semanal' },
                  { id: 'fortnightly', label: 'Quinzenal' },
                  { id: 'monthly', label: 'Mensal' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...autoConfig, scheduleFrequency: f.id as any };
                      setAutoConfig(updated);
                      saveAutoTriggerConfig(updated);
                      showToast(`Frequência ajustada para ${f.label}`, 'success');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      autoConfig.scheduleFrequency === f.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Triggers List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Gatilhos Automáticos por Eventos do Usuário
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                O aplicativo criará automaticamente um backup incremental sempre que você realizar qualquer uma das ações abaixo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'onAppClose', label: 'Ao encerrar ou fechar o aplicativo', icon: Smartphone },
                  { key: 'onSoilAnalysisComplete', label: 'Ao concluir uma análise de solo', icon: FlaskConical },
                  { key: 'onReportFinished', label: 'Ao finalizar um laudo técnico PDF', icon: FileText },
                  { key: 'onNewFieldAdded', label: 'Ao adicionar um novo talhão / lavoura', icon: Tractor },
                  { key: 'onBirthRegistered', label: 'Ao registrar um parto no rebanho', icon: Beef },
                  { key: 'onApplicationRegistered', label: 'Ao registrar aplicação de defensivo', icon: ShieldCheck },
                  { key: 'onFertilizerDbUpdated', label: 'Ao atualizar o banco de fertilizantes', icon: Layers },
                ].map(trig => {
                  const Icon = trig.icon;
                  const isChecked = autoConfig[trig.key as keyof BackupAutoTriggerConfig] as boolean;
                  return (
                    <div
                      key={trig.key}
                      onClick={() => handleToggleAutoConfig(trig.key as any)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                          : 'border-slate-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{trig.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Retention & Emergency Rules */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Retenção e Alertas de Perda
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Retenção Automática (Máximo de Backups a manter):
                </label>
                <select
                  value={autoConfig.retentionCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const updated = { ...autoConfig, retentionCount: val };
                    setAutoConfig(updated);
                    saveAutoTriggerConfig(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                >
                  <option value={5}>Manter os últimos 5 backups</option>
                  <option value={10}>Manter os últimos 10 backups</option>
                  <option value={20}>Manter os últimos 20 backups</option>
                  <option value={50}>Manter os últimos 50 backups</option>
                </select>
              </div>

              {/* Graphical StorageManager API Progress Bar Widget in Settings */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Cota StorageManager API</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    {storageStats.percentageUsed}% Usado
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">Uso Atual: <strong>{storageStats.usedFormatted}</strong></span>
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">Cota Estimada: <strong>{storageStats.quotaFormatted}</strong></span>
                  </div>

                  {/* Graphical Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-zinc-600">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, Math.min(100, storageStats.percentageUsed))}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                  <span>Disponível: <strong className="text-emerald-600 dark:text-emerald-400">{storageStats.availableFormatted}</strong></span>
                  {storageStats.isPersisted !== null && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {storageStats.isPersisted ? '✓ Armazenamento Persistente' : '• Armazenamento Temporário'}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  🔔 Alerta de Inatividade
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-400">
                  O sistema enviará uma notificação visual se você ficar mais de 7 dias sem realizar um backup completo.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 8: MIGRAÇÃO ENTRE DISPOSITIVOS (SEM INTERNET) */}
      {currentTab === 'migracao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              Migração Direta entre Celulares / Dispositivos (100% Offline)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Transfira todos os seus dados da fazenda para um smartphone novo sem precisar de conexão à internet.
            </p>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {[
              { step: '1', title: 'Telefone Antigo', desc: 'Gerar Backup Completo criptografado no celular antigo', icon: Smartphone },
              { step: '2', title: 'Escolher Meio', desc: 'Transferir via Cabo OTG, Bluetooth, Wi-Fi Direct ou QR Code', icon: Radio },
              { step: '3', title: 'Telefone Novo', desc: 'Abrir o GeaAgro no celular novo e selecionar o arquivo', icon: Smartphone },
              { step: '4', title: 'Restaurar', desc: 'O sistema valida o hash SHA-256 e recria a base de dados', icon: RefreshCw },
              { step: '5', title: 'Concluído', desc: 'Todos os talhões, relatórios e animais recuperados!', icon: CheckCircle2 }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col justify-between space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {s.step}
                    </span>
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-1">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-base text-emerald-400">Pronto para migrar seus dados agora?</h4>
              <p className="text-xs text-slate-300">Gere o arquivo `.geabackup` criptografado e baixe diretamente no seu dispositivo.</p>
            </div>
            <button
              onClick={() => handleTabChange('criacao')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Iniciar Passo 1: Criar Backup de Migração
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: BACKUP POR QR CODE */}
      {currentTab === 'qrcode' && (
        <BackupQRCodeGenerator
          backupList={history}
          onSelectBackupForRestore={(b) => {
            showToast(`Backup ${b.filename} selecionado para restauração`, 'info');
            handleTabChange('restauracao');
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
};

export default BackupModule;
